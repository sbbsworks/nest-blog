import type {} from "@nestjs/common"
import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsNumber,
  } from 'class-validator'
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import {Types} from 'mongoose'
import {PickType} from '@nestjs/swagger'
import {notifierConfig} from '../configs/notifier.config'

export type TSubscriberId = Types.ObjectId

export enum ENotifierSubscriberFields {
    _id = '_id',
    email = 'email',
    fullName = 'fullName',
    interval = 'interval',
    nextNotifyAt = 'nextNotifyAt',
}

export enum ESubscriberIntervals {
    minAsDisabled = 0,
    max = 604800,
}

const _notifierConfig = notifierConfig()

declare interface SchemaOptions {
    pluralization: boolean;
    collection: string;
}
@Schema({
    collection: _notifierConfig.NOTIFIER_SUBSCRIBERS_COLLECTION_NAME as string,
    pluralization: false,
    autoIndex: true,
    timestamps: true,
    versionKey: false,
} as SchemaOptions)
export class NotifierSubscriber {
    readonly [ENotifierSubscriberFields._id]: TSubscriberId;

    @Prop({type: String, required: true})
    @IsEmail()
    readonly [ENotifierSubscriberFields.email]: string;

    @Prop({type: String, required: true})
    @IsString()
    @IsNotEmpty()
    readonly [ENotifierSubscriberFields.fullName]: string;

    @Prop({type: Number, required: true, default: 0})
    @IsNumber()
    readonly [ENotifierSubscriberFields.nextNotifyAt]: number;

    @Prop({type: Number, required: true, default: ESubscriberIntervals.minAsDisabled})
    @IsNumber()
    readonly [ENotifierSubscriberFields.interval]: number;
}

export class NotifierSubscriberDTO extends PickType(NotifierSubscriber, [
    ENotifierSubscriberFields.email,
    ENotifierSubscriberFields.fullName,
    ENotifierSubscriberFields.interval,
] as const) {}

export const NotifierSubscriberSchema = SchemaFactory.createForClass(NotifierSubscriber)
NotifierSubscriberSchema.index({[ENotifierSubscriberFields.email]: 1,}, {unique: true,});
