import {Injectable, Logger} from "@nestjs/common"
import {InjectModel} from '@nestjs/mongoose'
import {Cron} from "@nestjs/schedule"
import {EBlogRouts, ENotifierQueueFields, ENotifierSubscriberFields, ESubscriberIntervals, NotifierQueue, NotifierSubscriber, envConfig} from '@shared'
import {ClientSession, Model, Types} from 'mongoose'
import {MailerService} from '@nestjs-modules/mailer'

type TSubscriber = NotifierSubscriber & Required<{
    _id: Types.ObjectId;
}>
type TPosts = (NotifierQueue & Required<{
    _id: Types.ObjectId;
}>)[]

type TNormalizedPost = {
    authorId: string;
    type: string;
    id: string;
    date: number;
}

const _envConfig = envConfig()
const postsBaseUrl = process.env.GATEWAY_PUBLIC_DOMAIN ? process.env.GATEWAY_PUBLIC_DOMAIN : 'http://localhost'
const postsApiPort = process.env.GATEWAY_PUBLIC_PORT ? process.env.GATEWAY_PUBLIC_PORT : _envConfig.BLOG_API_PORT

const jobPause = 0
const _wait = (): Promise<boolean> => new Promise((resolve) => setTimeout(() => resolve(true), jobPause))

const errorPause = 5000

const lineBreak = '<br>'
const cronTimePattern = '*/1 * * * * *'

@Injectable()
export class HandleQueueService {
    #jobStartedAt: number = 0
    #lastNotified: number = 0
    #session: ClientSession
    private readonly logger = new Logger(HandleQueueService.name)

    constructor(
        @InjectModel(NotifierSubscriber.name) private readonly subscriberModel: Model<NotifierSubscriber>,
        @InjectModel(NotifierQueue.name) private readonly queueModel: Model<NotifierQueue>,
        private readonly mailerService: MailerService
    ) {}
    @Cron(cronTimePattern)
    async handleQueue() {
        if(!this.#jobStartedAt) {
            this.#jobStartedAt = Date.now()
            const subscriber = await this.#getSubscriber()
            if(!subscriber) {
                await this.#nextJob()
                return
            }
            const posts = await this.#getPosts(subscriber)
            if(!Array.isArray(posts)) {
                await this.#nextJob()
                return
            }
            this.#notifySubscriber(subscriber, posts, this.#jobStartedAt)
            await this.#nextJob()
        }
    }
    async #getSubscriber() {
        try {
            const subscriber = await this.subscriberModel
                .findOne({
                    [ENotifierSubscriberFields.interval]: {
                        $gt: ESubscriberIntervals.minAsDisabled
                    },
                    [ENotifierSubscriberFields.nextNotifyAt]: {
                        $lt: this.#jobStartedAt
                    },
                })
                .sort({updatedAt: 1})
                .exec()
                subscriber && this.logger.debug(`Got subscriber ${subscriber.email} ${subscriber._id}`)
                return subscriber
        } catch (error) {
            this.logger.error((error as Error).message)
            return undefined
        }
    }
    async #getPosts(subscriber: TSubscriber) {
        try {
            this.#lastNotified = subscriber[ENotifierSubscriberFields.nextNotifyAt] - subscriber[ENotifierSubscriberFields.interval]
            const posts = await this.queueModel
                .find({
                    [ENotifierQueueFields.addedAt]: {
                        $gt: this.#lastNotified > 0 ? this.#lastNotified : this.#jobStartedAt
                    },
                })
                .exec()
                posts.length ?
                    this.logger.debug(`Got posts (${posts.length}) for subscriber: ${subscriber._id} ${subscriber.email}`) :
                    this.logger.debug(`There's NO posts for subscriber: ${subscriber._id} ${subscriber.email}`)
                return posts
        } catch (error) {
            this.logger.error((error as Error).message)
            return undefined
        }
    }
    async #updateSubscriber(subscriber: TSubscriber, toDate: number) {
        await this.subscriberModel
                .findOneAndUpdate(
                    {
                        [ENotifierSubscriberFields._id]: subscriber[ENotifierSubscriberFields._id],
                    },
                    {
                        [ENotifierSubscriberFields.nextNotifyAt]: toDate + subscriber[ENotifierSubscriberFields.interval],
                    },
                )
                .session(this.#session)
                .exec()
    }
    async #notifySubscriber(subscriber: TSubscriber, posts: TPosts, toDate: number) {
        try {
            this.#session = await this.subscriberModel.startSession()
            this.#session.startTransaction()
            if(!posts.length) {
                await this.#updateSubscriber(subscriber, toDate)
                await this.#session.commitTransaction()
                await this.#session.endSession()
                return true
            }
            const [to, subject, message] = await this.#makeEmail(subscriber, posts, toDate)
            await this.#updateSubscriber(subscriber, toDate)
            await this.mailerService
                .sendMail({
                    to,
                    subject,
                    html: message,
                })
            await this.#session.commitTransaction()
            await this.#session.endSession()
            return true
        } catch (error) {
            this.#jobStartedAt = 1
            setTimeout(() => {
                this.#jobStartedAt = 0
            }, errorPause)
            this.#session && await this.#session.abortTransaction()
            this.#session && await this.#session.endSession()
            this.logger.error((error as Error).message)
        }
    }
    async #makeEmail(subscriber: TSubscriber, posts: TPosts, toDate: number) {
        const to = `${subscriber[ENotifierSubscriberFields.fullName]} <${subscriber[ENotifierSubscriberFields.email]}>`
        const subject = `${_envConfig.API_PREFIX} ${_envConfig.API_DOCS_BLOG_TITLE} ${_envConfig.API_DOCS_NOTIFIER_TITLE}`
        const sinceDate = this.#lastNotified
        const _posts = Object.entries(posts
            .reduce((accumulator, current) => {
                if (!accumulator[`${current[ENotifierQueueFields.authorId]}${current[ENotifierQueueFields.authorName]}`]) {
                    accumulator[`${current[ENotifierQueueFields.authorId]}${current[ENotifierQueueFields.authorName]}`] = []
                }
                accumulator[`${current[ENotifierQueueFields.authorId]}${current[ENotifierQueueFields.authorName]}`].push({
                    authorId: current[ENotifierQueueFields.authorId],
                    type: current[ENotifierQueueFields.postType],
                    id: current[ENotifierQueueFields.postId],
                    date: current[ENotifierQueueFields.addedAt],
                })
                return accumulator
            }, {} as Record<string, TNormalizedPost[]>))
            .map((_post, key) => {
                const __post = []
                const authorName = _post[0].replace(_post[1][0].authorId, '')
                __post.push(`<div><strong>${authorName}</strong> has <strong>${_post[1].length}</strong> new posts:</div>`)
                __post.push(..._post[1].map((__post) => {
                    return `
                        <div><span style="margin-right:10px">${(new Date (__post.date)).toISOString()}</span><a href="${postsBaseUrl}:${postsApiPort}/${_envConfig.API_PREFIX}/${EBlogRouts.blog}/${EBlogRouts.posts}/${EBlogRouts.one}/${__post.id}" target="_blank">${__post.type}</a></div>
                    `
                }))
                __post.push(...[
                    lineBreak,
                ])
                return __post.join('')
            })
            _posts.unshift(...[
                `<div>Hi, ${subscriber[ENotifierSubscriberFields.fullName]}</div>`,
                lineBreak,
                `<div>New posts since ${(new Date (sinceDate)).toISOString()} to ${(new Date (toDate)).toISOString()}</div>`,
                lineBreak,
            ])
            _posts.push(...[
                lineBreak,
                `<div>Have a nice day</div>`,
            ])
        return [to, subject, _posts.join('')]
    }
    async #nextJob() {
        await _wait()
        this.#jobStartedAt = 0
    }
}
