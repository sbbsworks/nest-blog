export type TTimeStampTypes = Date|number

export enum EPrismaDbTables {
    posts = 'posts',
    likes = 'likes',
    comments = 'comments',
    tags = 'tags',
    feeds = 'feeds'
}

export enum EId {
    id = 'id',
}
export enum EMongoId {
    _id = '_id',
}

export enum EDbDates {
    createdAt = 'createdAt',
    updatedAt = 'updatedAt',
    publishedAt = 'publishedAt',
}
export type TDbDates = {
    [EDbDates.createdAt]?: TTimeStampTypes;
    [EDbDates.updatedAt]?: TTimeStampTypes;
}
export type DbEntity<T> = {
    [k in EId.id | EMongoId._id]?: T;
} & TDbDates
