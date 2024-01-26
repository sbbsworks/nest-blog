import type {} from "@nestjs/common"
import {IsNotEmpty, IsString, MaxLength, MinLength} from "class-validator"
import {ApiHideProperty, ApiProperty, OmitType} from "@nestjs/swagger"
import {appConfig} from "../configs/app.config"
import {EDbDates, EId} from "../entities/db.entity"
import {ECommentDbEntityFields} from "../entities/comment.entity"
import {EUserDTOFields, ReturnedUserRDO, TUserId} from "./user.dto"
import {TPostId} from "./post.dto"
import {Transform} from 'class-transformer'
import {EPaginationFields} from './pagination.dto'

export type TCommentId = string
const _appConfig = appConfig()

export class CommentDTO {
    @ApiProperty()
    @IsString()
    @MinLength(+_appConfig.COMMENT_TEXT_MIN_LENGTH)
    @MaxLength(+_appConfig.COMMENT_TEXT_MAX_LENGTH)
    readonly text: string;

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly postId: TPostId;

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;
}
export class DeleteCommentDTO {

    @IsString()
    @IsNotEmpty()
    readonly commentId: TCommentId;

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;
}

export class CommentIdDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly commentId: TCommentId;
}

export class AddCommentRDO {
    @ApiProperty()
    [EId.id]: TCommentId
}
export class DeleteCommentRDO {
    @ApiProperty()
    result: boolean
}

export class CommentsPaginationDTO {
    @ApiHideProperty()
    @Transform((_this) => +_appConfig.COMMENTS_LIST_DEFAULT_OFFSET)
    readonly [EPaginationFields.offset]?: number|undefined

    @ApiHideProperty()
    @Transform((_this) => +_appConfig.COMMENTS_LIST_DEFAULT_LIMIT)
    readonly [EPaginationFields.limit]?: number|undefined

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly postId: TPostId;
}


export class ReturnedCommentRDO {
    @ApiProperty({required: true})
    [EId.id]: TCommentId;
    @ApiProperty({required: true})
    [ECommentDbEntityFields.userId]: TUserId;
    @ApiProperty({required: true})
    [ECommentDbEntityFields.postId]: TPostId
    @ApiProperty({required: true})
    [ECommentDbEntityFields.comment]: string;
    @ApiProperty({required: true})
    [EDbDates.createdAt]: string;
    @ApiProperty({required: true})
    [EDbDates.updatedAt]: string;
}

export class ReturnedHydratedCommentsRDO extends OmitType(ReturnedCommentRDO, [ECommentDbEntityFields.userId]) {
    @ApiProperty({required: true})
    ["author"]: null|ReturnedUserRDO;
}
