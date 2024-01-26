import {HttpException, HttpStatus, Injectable} from '@nestjs/common'
import {RpcException} from '@nestjs/microservices'
import {AddFeedRDO, AppRpcResponse, DeleteFeedRDO, EId, ELoggerMessages, FeedDTO, FeedSubscribeDTO, FeedUnSubscribeDTO, FeedsPrismaRepositoryService, ReturnedPostRDO, TFeedId} from '@shared'
import mongoose from 'mongoose'

@Injectable()
export class FeedService {
    constructor(
        private readonly feedsPrisma: FeedsPrismaRepositoryService,
        private readonly appRpcResponse: AppRpcResponse,
    ){}
    async getUserFeed(data: FeedDTO): Promise<ReturnedPostRDO[]> {
        try {
            const userFeed = await this.feedsPrisma.getUserFeed(data)
            return userFeed
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.badGateway,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async subscribe(data: FeedSubscribeDTO): Promise<AddFeedRDO> {
        try {
            const {donorId, ownerId} = data
            if(!mongoose.isValidObjectId(donorId)) {
                throw new HttpException(ELoggerMessages.coudNotSubscribe, HttpStatus.BAD_REQUEST)
            }
            if(`${donorId}` === `${ownerId}`) {
                throw new HttpException(ELoggerMessages.coudNotSubscribe, HttpStatus.CONFLICT)
            }
            const _feed = await this.feedsPrisma.prepareFeed(ownerId, donorId)
            const newFeedId = await this.feedsPrisma.save(_feed) as TFeedId
            return {result: !!(newFeedId)}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.coudNotSubscribe,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
    async unsubscribe(data: FeedUnSubscribeDTO): Promise<DeleteFeedRDO> {
        try {
            const {donorId, ownerId} = data
            if(!mongoose.isValidObjectId(donorId)) {
                throw new HttpException(ELoggerMessages.coudNotUnSubscribe, HttpStatus.BAD_REQUEST)
            }
            const _feedId = await this.feedsPrisma.findFeed(ownerId, donorId)
            const feedId = _feedId?.[0]?.[EId.id]
            if(!feedId) {
                throw new HttpException(ELoggerMessages.coudNotUnSubscribe, HttpStatus.NO_CONTENT)
            }
            const deleted = await this.feedsPrisma.delete(feedId)
            if(!deleted) {
                throw new HttpException(ELoggerMessages.coudNotUnSubscribe, HttpStatus.NO_CONTENT)
            }
            return {result: deleted}
        } catch (error) {
            throw new RpcException(
                this.appRpcResponse.makeError({
                    responseMessage: ELoggerMessages.coudNotUnSubscribe,
                    statusCode: HttpStatus.BAD_GATEWAY,
                    originalError: error
            }))
        }
    }
}
