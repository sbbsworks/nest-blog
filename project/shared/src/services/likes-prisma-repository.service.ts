import { Injectable } from "@nestjs/common/decorators";
import { EPrismaDbTables } from "../entities/db.entity";
import { ABlogPrismaRepository } from "../lib/abstract-prisma-repository";
import { BlogPrismaService } from "./blog-prisma.service";
import { TPostId } from "../dtos/post.dto";
import { TUserId } from "../dtos/user.dto";
import { ELikeDbEntityFields } from "../entities/like.entity";

export type TPrismaClientLikesTable = BlogPrismaService[EPrismaDbTables.likes]

export type TLikeEntity = {
    [ELikeDbEntityFields.postId]: TPostId;
    [ELikeDbEntityFields.userId]: TUserId;
}

@Injectable()
export class LikesPrismaRepositoryService extends ABlogPrismaRepository<TLikeEntity>{
    #rawClient:TPrismaClientLikesTable
    constructor(
        protected readonly prismaClient: BlogPrismaService
    ) {
        super(prismaClient[EPrismaDbTables.likes])
        this.#rawClient = prismaClient[EPrismaDbTables.likes]
    }
    async prepareLike(postId: TPostId, userId: TUserId): Promise<TLikeEntity> {
        return {[ELikeDbEntityFields.postId]: postId, [ELikeDbEntityFields.userId]: userId}
    }
}
