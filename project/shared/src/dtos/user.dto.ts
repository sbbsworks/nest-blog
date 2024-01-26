import type {} from "@nestjs/common"
import {
    IsString,
    MaxLength,
    MinLength,
    IsNotEmpty,
    IsOptional,
    IsEmail,
    IsNumber,
    Min,
    Max,
    Validate,
    IsArray
  } from 'class-validator'
import {ApiProperty, PickType} from '@nestjs/swagger'
import {appConfig} from "../configs/app.config"
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import {mongoUsersConfig} from "../configs/mongo-users.config"
import {Types} from 'mongoose'
import {EDbDates, EId, TTimeStampTypes} from "../entities/db.entity"
import {ESubscriberIntervals} from './notifier-subscriber.dto'
import {Transform} from 'class-transformer'
import {MemoryStoredFile} from 'nestjs-form-data'
import {FileValidator} from '../lib/file.validator'

export type TUserId = Types.ObjectId

const _appConfig = appConfig()
const _mongoUsersConfig = mongoUsersConfig()

export enum EUserDTOFields {
    email = 'email',
    password = 'password',
    preparedAvatar = 'preparedAvatar',
    fullName = 'fullName',
    userId = 'userId'
}

@Schema()
export class UserDTO {
    @Prop()
    @ApiProperty()
    @IsEmail()
    readonly [EUserDTOFields.email]: string;

    @Prop()
    @ApiProperty()
    @IsString()
    @MinLength(+_appConfig.USER_NAME_MIN_LENGTH)
    @MaxLength(+_appConfig.USER_NAME_MAX_LENGTH)
    readonly fullName: string;

    @Prop()
    @ApiProperty({ type: 'string', minLength: +_appConfig.USER_PASSWORD_MIN_LENGTH, maxLength: +_appConfig.USER_PASSWORD_MAX_LENGTH, required: true })
    @IsString()
    @MinLength(+_appConfig.USER_PASSWORD_MIN_LENGTH)
    @MaxLength(+_appConfig.USER_PASSWORD_MAX_LENGTH)
    readonly [EUserDTOFields.password]: string;

    @ApiProperty({type: 'string', format: 'binary', required: false})
    @IsOptional()
    @Validate(FileValidator, [appConfig().USER_AVATAR_MAX_FILE_SIZE])
    readonly avatar?: MemoryStoredFile|undefined;
}

export class UserIdDTO {
    @ApiProperty({type: String, required: true})
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;
}

export class UserSignInDTO extends PickType(UserDTO, [EUserDTOFields.email] as const) {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly currentPassword: string;
}

export class UserUpdatePasswordDTO extends PickType(UserDTO, [EUserDTOFields.password] as const) {
    @ApiProperty({ type: 'string', minLength: +_appConfig.USER_PASSWORD_MIN_LENGTH, maxLength: +_appConfig.USER_PASSWORD_MAX_LENGTH, required: true })
    @IsString()
    @IsNotEmpty()
    readonly currentPassword: string;

    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;
}

declare interface SchemaOptions {
    pluralization: boolean;
    collection: string;
}
@Schema({ collection: _mongoUsersConfig.MONGO_USERS_DEFAULT_DB_NAME as string, pluralization: false, autoIndex: true, timestamps:true} as SchemaOptions)
export class UserDTOSchema extends UserDTO {
    @Prop()
    [EUserDTOFields.preparedAvatar]?: string
}
export const UserSchema = SchemaFactory.createForClass(UserDTOSchema)
UserSchema.index({[EUserDTOFields.email]: 1,}, {unique: true,});

export class ReturnedUserRDO {
    @ApiProperty({ type: 'string', required: true })
    [EId.id]: TUserId;

    @ApiProperty({ type: 'string', minLength: +_appConfig.USER_NAME_MIN_LENGTH, maxLength: +_appConfig.USER_NAME_MAX_LENGTH, required: true })
    fullName: string;

    @ApiProperty()
    avatar?: string;

    @ApiProperty()
    [EUserDTOFields.email]: string;

    @ApiProperty({ type: 'number|Date', required: true })
    [EDbDates.createdAt]:TTimeStampTypes;

    @ApiProperty({ type: 'number|Date', required: true })
    [EDbDates.updatedAt]:TTimeStampTypes;
}

export class AuthUserRDO {
    readonly [EId.id]?: TUserId|null;
    readonly [EUserDTOFields.fullName]?: string;
    @ApiProperty({type: 'boolean', required: false})
    readonly result?: boolean
}

export class ChangeUserPasswordRDO {
    @ApiProperty({ type: 'boolean', required: true })
    readonly result: boolean
}

export class SubscribeToPostsDTO {
    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.userId]: TUserId;

    @IsString()
    @IsNotEmpty()
    readonly [EUserDTOFields.fullName]: string;

    @Transform((_this) => Number.isNaN(_this.value) ? null : +_this.value)
    @IsNumber()
    @Min(ESubscriberIntervals.minAsDisabled)
    @Max(ESubscriberIntervals.max)
    readonly interval: number;
}
export class SubscribeToPostsApiDTO {
    @ApiProperty({type: 'Number', required: true, default: ESubscriberIntervals.minAsDisabled})
    readonly interval: number;
}

export class SubscribedToPostsRDO {
    @ApiProperty({ type: 'boolean', required: true })
    readonly result: boolean
}

export class UsersIdsDTO {
    @IsArray()
    usersIds: TUserId[]
}
