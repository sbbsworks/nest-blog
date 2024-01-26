import {BadRequestException, CallHandler, ExecutionContext, Global, HttpException, HttpStatus, Injectable, Logger, NestInterceptor} from '@nestjs/common'
import {Observable, catchError, throwError} from 'rxjs'
import {ELoggerMessages} from './logger.enum'

@Injectable()
export class AppLogger implements NestInterceptor {
    private readonly logger = new Logger(AppLogger.name)

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest()
        return next.handle().pipe(
            catchError((error) => {
                const _error = error as AppError
                if(error instanceof HttpException && (error as any).status !== HttpStatus.BAD_GATEWAY && (error as any).status !== HttpStatus.GATEWAY_TIMEOUT) {
                    return throwError(() => new HttpException(Array.isArray((error as any).response) ? (error as any).response.message : (error as any).response, (error as any).status));
                }
                if((_error.originalError instanceof HttpException || _error.originalError?.name === 'HttpException') && _error.originalError?.status !== HttpStatus.BAD_GATEWAY && _error.originalError?.status !== HttpStatus.GATEWAY_TIMEOUT) {
                    return throwError(() => new HttpException(_error.originalError.response, _error.originalError.status));
                }
                if(_error.statusCode === HttpStatus.BAD_REQUEST) {
                    return throwError(() => new BadRequestException(_error.messages));
                }
                if(_error.originalError?.code === 11000) {
                    return throwError(() => new HttpException(ELoggerMessages.alreadyExists, HttpStatus.CONFLICT));
                }
                if (_error.originalError?.name === 'PrismaClientKnownRequestError') {
                    if(_error.responseMessage === ELoggerMessages.postWasNotUpdated) {
                        return throwError(() => new HttpException(_error.responseMessage as string, HttpStatus.NOT_FOUND));
                    }
                    if(_error.responseMessage === ELoggerMessages.postPublishingDateWasNotUpdated) {
                        return throwError(() => new HttpException(_error.responseMessage as string, HttpStatus.NOT_FOUND));
                    }
                    if(_error.responseMessage === ELoggerMessages.couldNotDeletePost) {
                        return throwError(() => new HttpException(_error.responseMessage as string, HttpStatus.NO_CONTENT));
                    }
                    if(_error.responseMessage === ELoggerMessages.couldNotRepostPost) {
                        return throwError(() => new HttpException(_error.responseMessage as string, HttpStatus.NOT_FOUND));
                    }
                    if(_error.responseMessage === ELoggerMessages.couldNotDeleteLike) {
                        return throwError(() => new HttpException(_error.responseMessage as string, HttpStatus.NO_CONTENT));
                    }
                    if(_error.responseMessage === ELoggerMessages.couldNotDeleteComment) {
                        return throwError(() => new HttpException(_error.responseMessage as string, HttpStatus.NO_CONTENT));
                    }
                    if(_error.responseMessage === ELoggerMessages.coudNotSubscribe) {
                        return throwError(() => new HttpException(_error.responseMessage as string, HttpStatus.CONFLICT));
                    }
                    this.logger.error({
                        url: request.url,
                        method: context.getHandler().name,
                        message: _error.message,
                        payload: _error.payload,
                    })
                    return throwError(() => new HttpException(_error.responseMessage || _error.originalError?.responseMessage || ELoggerMessages.badRequest, HttpStatus.BAD_REQUEST));
                }
                this.logger.error({
                    url: request.url,
                    method: context.getHandler().name,
                    message: _error.message,
                    payload: _error.payload,
                    originalError: _error.originalError || error
                })
                if(_error.originalError?.code === 'ENOENT') {
                    return throwError(() => new HttpException(ELoggerMessages.uploadFailure, HttpStatus.BAD_GATEWAY));
                }
                if((error as any).status === HttpStatus.GATEWAY_TIMEOUT) {
                    return throwError(() => new HttpException((error as any).message || ELoggerMessages.badGateway, HttpStatus.GATEWAY_TIMEOUT));
                }
                return throwError(() => new HttpException(_error.responseMessage as string || ELoggerMessages.badGateway, Number(_error.statusCode) || HttpStatus.BAD_GATEWAY));
            })
        )
    }
}

export class AppError extends Error {
    public payload: any;
    public responseMessage?: string;
    public messages?: string|any[];
    public statusCode?: number|string;
    public originalError?: any;
    constructor(data: {error: any; responseMessage?: string; payload?: any}) {
        super()
        this.responseMessage = data.error.responseMessage || data.responseMessage
        this.payload = data.error.payload || data.payload
        this.messages = data.error.messages
        this.statusCode = data.error.statusCode
        this.originalError = data.error.originalError || data.error
    }
}

@Injectable()
@Global()
export class AppRpcResponse {
    public messages?: string|any[];
    public responseMessage?: string;
    public statusCode: number|string;
    public payload?: any;
    public originalError?: any;
    constructor () {}
    makeError(data: {
        messages?: string|any[];
        responseMessage?: string;
        statusCode: number|string;
        payload?: any;
        originalError?: any;
    }) {
        this.messages = data.messages
        this.responseMessage = data.responseMessage
        this.statusCode = data.statusCode
        this.payload = data.payload
        this.originalError = data.originalError
        return this
    }
}
