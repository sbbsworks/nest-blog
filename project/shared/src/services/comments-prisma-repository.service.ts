import { Injectable } from "@nestjs/common/decorators";
import { EPrismaDbTables } from "../entities/db.entity";
import { ABlogPrismaRepository } from "../lib/abstract-prisma-repository";
import { BlogPrismaService } from "./blog-prisma.service";
import { TPostId } from "../dtos/post.dto";
import { TUserId } from "../dtos/user.dto";
import { ELikeDbEntityFields } from "../entities/like.entity";
import { ECommentDbEntityFields } from "../entities/comment.entity";

export type TPrismaClientCommentsTable = BlogPrismaService[EPrismaDbTables.comments]

export type TCommentEntity = {
    [ECommentDbEntityFields.postId]: TPostId;
    [ECommentDbEntityFields.userId]: TUserId;
    [ECommentDbEntityFields.comment]: string;
}

@Injectable()
export class CommentsPrismaRepositoryService extends ABlogPrismaRepository<TCommentEntity>{
    #rawClient:TPrismaClientCommentsTable
    constructor(
        protected readonly prismaClient: BlogPrismaService
    ) {
        super(prismaClient[EPrismaDbTables.comments])
        this.#rawClient = prismaClient[EPrismaDbTables.comments]
    }
    async prepareComment(comment: string, postId: TPostId, userId: TUserId): Promise<TCommentEntity> {
        return {[ECommentDbEntityFields.comment]: comment, [ELikeDbEntityFields.postId]: postId, [ELikeDbEntityFields.userId]: userId}
    }
}
