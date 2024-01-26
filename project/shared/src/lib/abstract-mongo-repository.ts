import {IRepository, TId } from "./abstract-repository"
import {Model} from 'mongoose'
import {IfAny, Document, Require_id} from 'mongoose'
import {DbEntity, EMongoId} from "../entities/db.entity"
import {EUserDTOFields} from '../dtos/user.dto'

export type TMongoReturnType<T extends DbEntity<TId>> = IfAny<T, any, Document<unknown, {}, T> & Require_id<T>> | null

export abstract class AMongoRepository<T extends DbEntity<TId>> implements IRepository<T>{
    constructor(
        protected readonly itemSchema: Model<T>
    ) {}

    async findAll(): Promise<T[]> {
        return this.itemSchema.aggregate([
            {$project: { __v: 0, [EUserDTOFields.password]: 0}},
        ]).exec()
    }
    async findOne(id: T[EMongoId._id]): Promise<TMongoReturnType<T>> {
        return this.itemSchema.findOne({[EMongoId._id]: id}, {__v: 0,}).exec()
    }
    async save(item: T): Promise<T[EMongoId._id]> {
        const result = await (new this.itemSchema({...item})).save()
        return result[EMongoId._id]
    }
    async update(id: T[EMongoId._id], item: Partial<T>): Promise<boolean> {
        const updated = await this.itemSchema.findOneAndUpdate({_id: id}, { $set: {...item}}, {new: true }).exec()
        return !!(updated)
    }
    async delete(id: T[EMongoId._id]): Promise<boolean> {
        const deleted = this.itemSchema.findOneAndDelete({_id: id}).exec()
        return !!(deleted)
    }
}
