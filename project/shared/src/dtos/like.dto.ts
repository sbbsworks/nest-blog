import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { EId } from "../entities/db.entity";
import {TPostId} from './post.dto';
import {EUserDTOFields, TUserId} from '@shared';

export type TLikeId = string

export class LikeIdDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly likeId: TLikeId;
}
export class AddLikeDTO {
    @IsString()
    @IsNotEmpty()
    readonly postId: TPostId;

    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;
}
export class DeleteLikeDTO {
    @IsString()
    @IsNotEmpty()
    readonly likeId: TLikeId;

    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;
}
export class AddLikeRDO {
    @ApiProperty()
    [EId.id]: TLikeId
}
export class DeleteLikeRDO {
    @ApiProperty()
    result: boolean
}
