import { TUserId, UserDTOSchema } from "../dtos/user.dto";
import { DbEntity } from "./db.entity";

export type UserEntity = DbEntity<TUserId> & UserDTOSchema
