import {ApiHideProperty, ApiProperty} from "@nestjs/swagger"
import {IsNotEmpty, IsString} from "class-validator"
import {TUserId} from '@shared'
import {SortedPaginationDTO} from './pagination.dto'
import {EFeedDbEntityFields} from '../entities/feed.entity'

export type TFeedId = string

export class FeedIdDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly feedId: TFeedId;
}
export class AddFeedRDO {
    @ApiProperty()
    result: boolean
}
export class DeleteFeedRDO {
    @ApiProperty()
    result: boolean
}

export class FeedDTO extends SortedPaginationDTO {
    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EFeedDbEntityFields.ownerId]: TUserId;
}
export class FeedSubscribeDTO {
    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EFeedDbEntityFields.ownerId]: TUserId;
    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EFeedDbEntityFields.donorId]: TUserId;
}

export class FeedUnSubscribeDTO {
    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EFeedDbEntityFields.ownerId]: TUserId;
    @ApiHideProperty()
    @IsString()
    @IsNotEmpty()
    readonly [EFeedDbEntityFields.donorId]: TUserId;
}
