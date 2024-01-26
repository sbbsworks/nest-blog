import { DbEntity, EId } from "./db.entity";

export type TTagId = string

export class TagEntity implements DbEntity<TTagId>{
    [EId.id]: TTagId;
}

export enum ETagDbEntityFields {
    name = 'name'
}
