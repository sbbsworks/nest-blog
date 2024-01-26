import { DbEntity, EId, EMongoId} from "../entities/db.entity";
import { TPostId } from "../dtos/post.dto";
import { TUserId } from "../dtos/user.dto";
import { TMongoReturnType } from "./abstract-mongo-repository";

export type TId = TPostId|TUserId

export interface IRepository<T extends DbEntity<TId>> {
    findAll({options, include, where}:{options?:any, include?:any, where?:any}): Promise<T[]>;
    findOne(id: T[EId.id]|T[EMongoId._id]): Promise<T|undefined> | Promise<TMongoReturnType<T>>;
    save(item: T): Promise<T[EId.id]|T[EMongoId._id]>;
    update(id: T[EId.id]|T[EMongoId._id], item: T): Promise<boolean>;
    delete(id: T[EId.id]|T[EMongoId._id]): Promise<boolean>;
}
