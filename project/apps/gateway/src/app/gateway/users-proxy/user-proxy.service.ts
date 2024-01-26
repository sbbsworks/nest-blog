import {HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import {AppError, ChangeUserPasswordRDO, ECommentDbEntityFields, EId, ELoggerMessages, EPostDbEntityFields, EUserDTOFields, EUsersRouts, ReturnedCommentRDO, ReturnedHydratedCommentsRDO, ReturnedHydratedPostRDO, ReturnedPostRDO, ReturnedUserRDO, SubscribedToPostsRDO, TUserId, UserIdDTO, UserUpdatePasswordDTO, rmqConfig} from '@shared'
import {ClientProxy} from '@nestjs/microservices'
import {lastValueFrom} from 'rxjs'
import {Types} from 'mongoose'

const _rmqConfig = rmqConfig()

type First<T extends any[]> = T extends [] ? never : T[0]
export type THydratedPostRDO = First<Awaited<ReturnType<typeof UserProxyService.prototype.postsHydrator>>>

@Injectable()
export class UserProxyService {
    constructor(
        @Inject(EUsersRouts.user) private readonly userClient: ClientProxy
    ){}
    async findOne(userId: UserIdDTO): Promise<ReturnedUserRDO> {
        try {
            return await lastValueFrom(this.userClient.send(
                EUsersRouts.user,
                userId
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: userId,
            })
        }
    }
    async updatePassword(data: UserUpdatePasswordDTO): Promise<ChangeUserPasswordRDO> {
        try {
            return await lastValueFrom(this.userClient.send(
                EUsersRouts.updatePassword,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data[EUserDTOFields.userId],
            })
        }
    }
    async subscribeToNewPostsNotifier(userId: TUserId, fullName: string, interval: number): Promise<SubscribedToPostsRDO> {
        try {
            const subscribed = await new Promise(async (resolve, reject) => {
                const rmqIsDown = setTimeout(() => {
                    reject(new HttpException(ELoggerMessages.coudNotSubscribe, HttpStatus.GATEWAY_TIMEOUT))
                }, +_rmqConfig.WAIT_FOR_RMQ_CONNECTION_TIMEOUT)
                const subscribed = await lastValueFrom(this.userClient.send(
                    EUsersRouts.subscribeToNewPostsNotifier,
                    {userId, fullName, interval}
                ))
                clearTimeout(rmqIsDown)
                resolve(subscribed)
            })
            return subscribed as SubscribedToPostsRDO
        } catch(error) {
            throw new AppError({
                error,
                payload: {userId, interval},
            })
        }
    }
    async postsHydrator(posts: ReturnedPostRDO[]): Promise<ReturnedHydratedPostRDO[]> {
        const usersIds: TUserId[] = []
        posts.forEach((post) => {
            Types.ObjectId.isValid(`${post[EPostDbEntityFields.userId]}`) && usersIds.push(post[EPostDbEntityFields.userId])
            post[EPostDbEntityFields.originalAuthorId] && Types.ObjectId.isValid(`${post[EPostDbEntityFields.originalAuthorId]}`) && usersIds.push(post[EPostDbEntityFields.originalAuthorId])
            post[EPostDbEntityFields.comments].forEach((comment) => {
                Types.ObjectId.isValid(comment.authorId) && usersIds.push(comment.authorId)
            })
            post[EPostDbEntityFields.likes].forEach((like) => {
                Types.ObjectId.isValid(like.authorId) && usersIds.push(like.authorId)
            })
        })
        const _users: ReturnedUserRDO[] = await lastValueFrom(this.userClient.send(
            EUsersRouts.hydrator,
            {usersIds: [...new Set(usersIds)]}
        ))
        return posts.map((post) => {
            const author = _users.find((user) => `${user[EId.id]}` === `${post[EPostDbEntityFields.userId]}`)
            const originalAuthor = post[EPostDbEntityFields.originalAuthorId] ? _users.find((user) =>`${user[EId.id]}` === `${post[EPostDbEntityFields.originalAuthorId]}`) : undefined
            const comments = post[EPostDbEntityFields.comments].map((comment) => {
                const author = _users.find((user) => `${user[EId.id]}` === `${comment.authorId}`)
                return {
                    ...comment, author: author || null, [ECommentDbEntityFields.userId]: undefined
                }
            })
            const likes = post[EPostDbEntityFields.likes].map((like) => {
                const author = _users.find((user) => `${user[EId.id]}` === `${like.authorId}`)
                return {
                    ...like, author: author || null, [ECommentDbEntityFields.userId]: undefined
                }
            })
            return {
                ...post, [EPostDbEntityFields.userId]: undefined, [EPostDbEntityFields.originalAuthorId]: undefined,
                author: author || null,
                originalAuthor: originalAuthor || null,
                comments,
                likes,
            }
        })
    }
    async commentsHydrator(comments: ReturnedCommentRDO[]): Promise<ReturnedHydratedCommentsRDO[]> {
        const usersIds: TUserId[] = []
        comments.forEach((comment) => {
            Types.ObjectId.isValid(`${comment[EPostDbEntityFields.userId]}`) && usersIds.push(comment[EPostDbEntityFields.userId])
        })
        const _users: ReturnedUserRDO[] = await lastValueFrom(this.userClient.send(
            EUsersRouts.hydrator,
            {usersIds: [...new Set(usersIds)]}
        ))
        return comments.map((comment) => {
            const author = _users.find((user) => `${user[EId.id]}` === `${comment[EPostDbEntityFields.userId]}`)
            return {
                ...comment, [EPostDbEntityFields.userId]: undefined,
                author: author || null,
            }
        })
    }
}
