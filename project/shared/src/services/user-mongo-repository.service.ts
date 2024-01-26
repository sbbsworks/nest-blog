import { Injectable } from "@nestjs/common/decorators";
import { UserEntity } from "../entities/user.entity";
import { EUserDTOFields, ReturnedUserRDO, TUserId, UserDTO } from "../dtos/user.dto";
import { AMongoRepository } from "../lib/abstract-mongo-repository";
import { UserDTOSchema } from "../dtos/user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { EDbDates, EId, EMongoId, TTimeStampTypes } from "../entities/db.entity";
import { MemoryStoredFile } from "nestjs-form-data";
import {readFile} from 'node:fs/promises'

@Injectable()
export class UserMongoRepositoryService extends AMongoRepository<UserEntity>{
    constructor(
        @InjectModel(UserDTOSchema.name) protected readonly itemSchema: Model<UserDTOSchema>,
    ) {
        super(itemSchema)
    }
    async findUsersByIds(usersIds: TUserId[]): Promise<UserEntity[]> {
        return await this.itemSchema.find({
            [EMongoId._id]: {$in: usersIds},
        }, { __v: 0, [EUserDTOFields.password]: 0}).exec()
    }
    async findByEmail(email: string): Promise<UserEntity | null> {
        return await this.itemSchema.findOne({email: email}).exec();
    }
    async prepareUser(user: UserDTO): Promise<UserEntity> {
        const preparedUser:UserEntity = {
            fullName: user.fullName,
            [EUserDTOFields.email]: user[EUserDTOFields.email],
            [EUserDTOFields.password]: user[EUserDTOFields.password]
        }
        if(user.avatar) {
            preparedUser[EUserDTOFields.preparedAvatar] = await this.#prepareAvatar(user.avatar)
        }
        return preparedUser
    }
    async #prepareAvatar(avatar: MemoryStoredFile): Promise<string> {
        //@ts-ignore
        const _avatar = await readFile(avatar.path, 'base64')
        //@ts-ignore
        return `data:${avatar.fileType.mime};base64,${_avatar}`
    }
    async prepareReturnedUser(dbUser: UserEntity): Promise<ReturnedUserRDO> {
        const returnedUser: ReturnedUserRDO = {
            [EId.id]: dbUser[EMongoId._id] as TUserId,
            fullName: dbUser.fullName,
            [EUserDTOFields.email]: dbUser[EUserDTOFields.email],
            [EDbDates.createdAt]: dbUser[EDbDates.createdAt] as TTimeStampTypes,
            [EDbDates.updatedAt]: dbUser[EDbDates.updatedAt] as TTimeStampTypes,
        }
        if(dbUser[EUserDTOFields.preparedAvatar]) {
            returnedUser.avatar = dbUser[EUserDTOFields.preparedAvatar]
        }
        return returnedUser
    }
}
