import {HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import {AddFeedRDO, AppError, AppRpcResponse, EBlogRouts, EFeedDbEntityFields, ELoggerMessages, EUserDTOFields, FeedDTO, FeedSubscribeDTO, FeedUnSubscribeDTO, ReturnedHydratedPostRDO, ReturnedPostRDO} from '@shared'
import {ClientProxy} from '@nestjs/microservices'
import {lastValueFrom} from 'rxjs'
import {UserProxyService} from '../users-proxy/user-proxy.service'

@Injectable()
export class BlogFeedProxyService {
    constructor(
        @Inject(EBlogRouts.blog) private readonly blogClient: ClientProxy,
        private readonly userProxyService: UserProxyService
    ){}
    async getUserFeed(data: FeedDTO): Promise<ReturnedHydratedPostRDO[]> {
        try {
            const feed = await lastValueFrom(this.blogClient.send(
                EBlogRouts.feed,
                data
            ))
            return await this.userProxyService.postsHydrator(feed)
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async subscribe(data: FeedSubscribeDTO): Promise<AddFeedRDO> {
        try {
            const donorId = data[EFeedDbEntityFields.donorId]
            const donorExists = !!(await this.userProxyService.findOne({[EUserDTOFields.userId]: donorId}))
            if(!donorExists) {
                throw new HttpException(ELoggerMessages.coudNotSubscribe, HttpStatus.NOT_FOUND)
            }
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.feedSubscribe,
                data
            ))
        } catch(error) {
            if((error as AppRpcResponse).originalError.response === ELoggerMessages.notFound) {
                (error as AppRpcResponse).originalError.response = ELoggerMessages.coudNotSubscribe
            }
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
    async unsubscribe(data: FeedUnSubscribeDTO): Promise<AddFeedRDO> {
        try {
            return await lastValueFrom(this.blogClient.send(
                EBlogRouts.feedUnSubscribe,
                data
            ))
        } catch(error) {
            throw new AppError({
                error,
                payload: data,
            })
        }
    }
}
