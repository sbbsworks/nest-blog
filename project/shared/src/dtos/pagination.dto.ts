import type {} from "@nestjs/common"
import {IsEnum, IsInt, IsOptional} from "class-validator"
import {Expose, Transform, Type} from "class-transformer"
import {ApiHideProperty, ApiProperty, PickType} from "@nestjs/swagger"
import {appConfig} from "../configs/app.config"

export enum EPaginationFields {
    offset = 'offset',
    limit = 'limit'
}

export enum EPostSortBy {
    date = 'publishedAt',
    likes = 'likes',
    comments = 'comments',
}

const _appConfig = appConfig()

export class PaginationDTO {
    @ApiProperty({ type: 'number', required: false, default: +_appConfig.POSTS_LIST_DEFAULT_OFFSET, description: `!(value % ${_appConfig.POSTS_LIST_DEFAULT_LIMIT}) ? value : 0`})
    @Expose()
    @Transform((_this) => {
        return +_this.value % +_appConfig.POSTS_LIST_DEFAULT_LIMIT || !_this.value ? +_appConfig.POSTS_LIST_DEFAULT_OFFSET : Math.abs(+_this.value)
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    readonly [EPaginationFields.offset]?: number|undefined

    @ApiHideProperty()
    @Expose()
    @Transform((_this) => +_appConfig.POSTS_LIST_DEFAULT_LIMIT)
    @IsInt()
    readonly [EPaginationFields.limit]?: number|undefined
}
export class SortedPaginationDTO extends PickType(PaginationDTO, [EPaginationFields.offset, EPaginationFields.limit] as const) {
    @ApiProperty({required: false, default: EPostSortBy.date})
    @Expose()
    @Transform((_this) => {
        return _this.value === undefined ? EPostSortBy.date : _this.value
    })
    @IsOptional()
    @IsEnum(EPostSortBy)
    readonly sort?: EPostSortBy
}
