import { ArrayMaxSize, IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength, NotContains, Validate, ValidateIf } from "class-validator"
import { IsYoutubeLink } from "../lib/is-youtube-link.validator"
import { ApiHideProperty, ApiProperty, OmitType, PickType } from '@nestjs/swagger'
import { appConfig } from "../configs/app.config"
import {MemoryStoredFile } from "nestjs-form-data"
import {FileValidator } from "../lib/file.validator"
import { Transform } from "class-transformer"
import { EDbDates, EId, EPrismaDbTables } from "../entities/db.entity";
import { EUserDTOFields, ReturnedUserRDO, TUserId } from "./user.dto";
import { JsonValue } from "@prisma/client/runtime/library";
import { TCommentId } from "./comment.dto";
import { ECommentDbEntityFields } from "../entities/comment.entity";
import { ETagDbEntityFields, TTagId } from "../entities/tag.entity";
import { TLikeId } from "./like.dto";
import { ELikeDbEntityFields } from "../entities/like.entity";
import {ERouteParams} from '../lib/routes';
import {SortedPaginationDTO} from './pagination.dto';

export type TPostId = string

export enum EPostType {
    video = 'video',
    text = 'text',
    citation = 'citation',
    photo = 'photo',
    link = 'link'
}

export enum EPostState {
    published = 'published',
    draft = 'draft'
}

export enum EPostDTOFields {
    postType = 'postType',
    tags = 'tags',
    photo = 'photo'
}

const _appConfig = appConfig()

export class PostDTO {
    @ApiProperty({required: false, description: 'required'})
    @IsEnum(EPostType)
    readonly postType: EPostType

    @ApiProperty({description: `applies only for post types: <b>${EPostType.video} ${EPostType.text}</b>`})
    @Transform((_this) => _this.obj.postType === EPostType.video || _this.obj.postType === EPostType.text ? _this.value : undefined)
    @ValidateIf(_this => _this.postType === EPostType.video || _this.postType === EPostType.text)
    @IsString()
    @MinLength(+_appConfig.POST_TITLE_MIN_LENGTH)
    @MaxLength(+_appConfig.POST_TITLE_MAX_LENGTH)
    readonly title?: string;

    @ApiProperty({description: `applies only for post types: <b>${EPostType.video}</b>`})
    @Transform((_this) => _this.obj.postType === EPostType.video ? _this.value : undefined)
    @ValidateIf(_this => _this.postType === EPostType.video)
    @IsUrl()
    @Validate(IsYoutubeLink)
    readonly youtubeVideoUrl?: string

    @ApiProperty({description: `applies only for post types: <b>${EPostType.text}</b>`})
    @Transform((_this) => _this.obj.postType === EPostType.text ? _this.value : undefined)
    @ValidateIf(_this => _this.postType === EPostType.text)
    @IsString()
    @MinLength(+_appConfig.POST_SPOILER_MIN_LENGTH)
    @MaxLength(+_appConfig.POST_SPOILER_MAX_LENGTH)
    readonly spoiler?: string;

    @ApiProperty({description: `applies only for post types: <b>${EPostType.text}</b>`})
    @Transform((_this) => _this.obj.postType === EPostType.text ? _this.value : undefined)
    @ValidateIf(_this => _this.postType === EPostType.text)
    @IsString()
    @MinLength(+_appConfig.POST_TEXT_MIN_LENGTH)
    @MaxLength(+_appConfig.POST_TEXT_MAX_LENGTH)
    readonly text?: string;

    @ApiProperty({description: `applies only for post types: <b>${EPostType.citation}</b>`})
    @Transform((_this) => _this.obj.postType === EPostType.citation ? _this.value : undefined)
    @ValidateIf(_this => _this.postType === EPostType.citation)
    @IsString()
    @MinLength(+_appConfig.POST_CITATION_MIN_LENGTH)
    @MaxLength(+_appConfig.POST_CITATION_MAX_LENGTH)
    readonly citation?: string;

    @ApiProperty({description: `applies only for post types: <b>${EPostType.citation}</b>`})
    @Transform((_this) => _this.obj.postType === EPostType.citation ? _this.value : undefined)
    @ValidateIf(_this => _this.postType === EPostType.citation)
    @IsString()
    @MinLength(+_appConfig.POST_CITATION_AUTHOR_MIN_LENGTH)
    @MaxLength(+_appConfig.POST_CITATION_AUTHOR_MAX_LENGTH)
    readonly citationAuthor?: string;

    @ApiProperty({description: `applies only for post types: <b>${EPostType.link}</b>`})
    @Transform((_this) => _this.obj.postType === EPostType.link ? _this.value : undefined)
    @ValidateIf(_this => _this.postType === EPostType.link)
    @IsUrl()
    readonly link?: string

    @ApiProperty({description: `applies only for post types: <b>${EPostType.link}</b>`})
    @Transform((_this) => _this.obj.postType === EPostType.link ? _this.value : undefined)
    @ValidateIf(_this => _this.postType === EPostType.link)
    @IsOptional()
    @IsString()
    @MinLength(+_appConfig.POST_LINK_DESCRIPTION_MIN_LENGTH)
    @MaxLength(+_appConfig.POST_LINK_DESCRIPTION_MAX_LENGTH)
    readonly linkDescription?: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false, description: `applies only for post types: <b>${EPostType.photo}</b>`})
    @Transform((_this) => _this.obj.postType === EPostType.photo ? _this.value : undefined)
    @ValidateIf(_this => _this.postType === EPostType.photo)
    @Validate(FileValidator, [appConfig().POST_PHOTO_MAX_FILE_SIZE])
    readonly [EPostDTOFields.photo]?: MemoryStoredFile;

    @ApiProperty({required: false})
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase().split(',').map(String) : value)
    @IsArray()
    @ArrayMaxSize(+_appConfig.POST_MAX_TAGS_ALLOWED)
    @IsString({each: true})
    @NotContains(' ', {each: true})
    @NotContains('\\n', {each: true})
    @NotContains('\\r', {each: true})
    @NotContains('&nbsp;', {each: true})
    @MinLength(+_appConfig.POST_TAG_MIN_LENGTH, {
        each: true,
    })
    @MaxLength(+_appConfig.POST_TAG_MAX_LENGTH, {
        each: true,
    })
    readonly [EPostDTOFields.tags]?: string[]

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.fullName]: string;
}

export class PostIdDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly postId: TPostId;
}

export class UpdatePostDTO extends OmitType(PostDTO, [EUserDTOFields.fullName] as const) {
    @ApiProperty({required: false})
    @IsOptional()
    @Transform(({ value }) => !value ? [] : value)
    @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase().split(',').map(String) : value)
    @IsArray()
    @ArrayMaxSize(+_appConfig.POST_MAX_TAGS_ALLOWED)
    @IsString({each: true})
    @NotContains(' ', {each: true})
    @NotContains('\\n', {each: true})
    @NotContains('\\r', {each: true})
    @NotContains('&nbsp;', {each: true})
    @MinLength(+_appConfig.POST_TAG_MIN_LENGTH, {
        each: true,
    })
    @MaxLength(+_appConfig.POST_TAG_MAX_LENGTH, {
        each: true,
    })
    readonly [EPostDTOFields.tags]?: string[]

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly postId: TPostId;
}

export class RePublishPostDateDTO {
    @ApiProperty()
    @IsDateString()
    [EDbDates.publishedAt]: Date

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly postId: TPostId;

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;
}

export class DeletePostDTO {
    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly postId: TPostId;

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;
}

export class RePostDTO {
    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly postId: TPostId;

    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;
}

export class PostTypeDTO extends PickType(PostDTO, [EPostDTOFields.postType] as const) {}

export class PostTagDTO {
    @ApiProperty({required: true})
    @IsString()
    @MinLength(+_appConfig.POST_TAG_MIN_LENGTH)
    @MaxLength(+_appConfig.POST_TAG_MAX_LENGTH)
    @NotContains(' ')
    @NotContains('\\n')
    @NotContains('\\r')
    @NotContains('&nbsp;')
    readonly [ERouteParams.postTag]: string
}

export class PostKeyphraseDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly keyphrase: string;
}

export class AddPostRDO {
    @ApiProperty()
    [EId.id]: TPostId
    @ApiProperty()
    notifier: string
}
export class UpdatePostRDO {
    @ApiProperty()
    result: boolean
}
export class DeletePostRDO {
    @ApiProperty()
    result: boolean
}

export class RePostRDO {
    @ApiProperty()
    [EId.id]: TPostId
}

export enum EPostDbEntityFields {
    postType = 'type',
    postBody = 'body',
    tags = 'tags',
    likes = 'likes',
    comments = 'comments',
    userId = 'authorId',
    postState = 'state',
    rePosted = 'rePosted',
    originalPostId = "originalPostId",
    originalAuthorId = "originalAuthorId",
}

export class ReturnedPostRDO {
    @ApiProperty({required: true})
    [EId.id]: TPostId
    @ApiProperty({required: true})
    [EPostDbEntityFields.userId]: TUserId
    @ApiProperty({required: true})
    [EPostDbEntityFields.postType]: EPostType
    @ApiProperty({required: true})
    [EPostDbEntityFields.postState]: EPostState
    @ApiProperty({required: true})
    [EPostDbEntityFields.rePosted]: EPostState
    @ApiProperty({required: true})
    [EPostDbEntityFields.originalPostId]: TPostId|null
    @ApiProperty({required: true})
    [EPostDbEntityFields.originalAuthorId]: TUserId|null
    @ApiProperty({required: true})
    [EPostDbEntityFields.postBody]: JsonValue
    @ApiProperty({required: true})
    [EDbDates.createdAt]: string|number
    @ApiProperty({required: true})
    [EDbDates.updatedAt]: string|number
    @ApiProperty({required: true})
    [EDbDates.publishedAt]: string|number
    @ApiProperty({required: true})
    [EPrismaDbTables.likes]: {
        [EId.id]: TLikeId,
        [ELikeDbEntityFields.userId]: TUserId,
        [ELikeDbEntityFields.postId]: TPostId,
        [EDbDates.createdAt]: string|number,
        [EDbDates.updatedAt]: string|number,
    }[]
    @ApiProperty({required: true})
    [EPrismaDbTables.comments]: {
        [EId.id]: TCommentId,
        [ECommentDbEntityFields.postId]: TPostId,
        [ECommentDbEntityFields.userId]: TUserId,
        [ECommentDbEntityFields.comment]: string,
        [EDbDates.createdAt]: string|number,
        [EDbDates.updatedAt]: string|number,
    }[]
    @ApiProperty({required: true})
    [EPrismaDbTables.tags]: {
        [EId.id]: TTagId,
        [ETagDbEntityFields.name]: string,
    }[]
}

export class ReturnedHydratedPostRDO extends OmitType(ReturnedPostRDO, [EPostDbEntityFields.userId, EPostDbEntityFields.originalAuthorId, EPrismaDbTables.comments, EPrismaDbTables.likes] as const) {
    @ApiProperty({required: true})
    ["author"]: null|ReturnedUserRDO;
    @ApiProperty({required: true})
    ["originalAuthor"]: null|ReturnedUserRDO;
    @ApiProperty({required: true})
    [EPrismaDbTables.comments]: {
        [EId.id]: TCommentId,
        [ECommentDbEntityFields.postId]: TPostId,
        ["author"]: null|ReturnedUserRDO;
        [ECommentDbEntityFields.userId]: undefined;
        [ECommentDbEntityFields.comment]: string,
        [EDbDates.createdAt]: string|number,
        [EDbDates.updatedAt]: string|number,
    }[];
    @ApiProperty({required: true})
    [EPrismaDbTables.likes]: {
        [EId.id]: TLikeId,
        [ELikeDbEntityFields.postId]: TPostId;
        ["author"]: null|ReturnedUserRDO;
        [ELikeDbEntityFields.userId]: undefined;
        [EDbDates.createdAt]: string|number,
        [EDbDates.updatedAt]: string|number,
    }[];
}

export class UserPostsDTO extends SortedPaginationDTO {
    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: string;
}