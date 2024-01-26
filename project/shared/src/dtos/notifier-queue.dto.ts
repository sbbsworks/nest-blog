import type {} from "@nestjs/common"
import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsEnum,
  } from 'class-validator'
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import {Types} from 'mongoose'
import {OmitType} from '@nestjs/swagger'
import {notifierConfig} from '../configs/notifier.config'
import {EPostType, TPostId} from './post.dto'
import {Transform} from 'class-transformer'

export type TQueueId = Types.ObjectId

export enum ENotifierQueueFields {
    _id = '_id',
    postId = 'postId',
    postType = 'postType',
    authorId = 'authorId',
    authorName = 'authorName',
    addedAt = 'addedAt',
}

const _notifierConfig = notifierConfig()

declare interface SchemaOptions {
    pluralization: boolean;
    collection: string;
}
@Schema({
    collection: _notifierConfig.NOTIFIER_QUEUE_COLLECTION_NAME as string,
    pluralization: false,
    autoIndex: true,
    timestamps: true, versionKey: false,
} as SchemaOptions)
export class NotifierQueue {
    readonly [ENotifierQueueFields._id]: TQueueId;

    @Prop({type: String})
    @IsString()
    @IsNotEmpty()
    readonly [ENotifierQueueFields.postId]: TPostId;

    @Prop({type: String, enum: EPostType})
    @IsEnum(EPostType)
    readonly [ENotifierQueueFields.postType]: string;

    @Prop()
    @Transform((_this) => Types.ObjectId.isValid(_this.value) ? _this.value : undefined)
    @IsString()
    @IsNotEmpty()
    readonly [ENotifierQueueFields.authorId]: string;

    @Prop()
    @IsString()
    @IsNotEmpty()
    readonly [ENotifierQueueFields.authorName]: string;

    @Prop()
    @IsNumber()
    readonly [ENotifierQueueFields.addedAt]: number;
}

export class NotifierQueueDTO extends OmitType(NotifierQueue, [ENotifierQueueFields._id, ENotifierQueueFields.addedAt] as const) {}

export const NotifierQueueSchema = SchemaFactory.createForClass(NotifierQueue)
NotifierQueueSchema.index({[ENotifierQueueFields.postId]: 1,}, {unique: true,});
