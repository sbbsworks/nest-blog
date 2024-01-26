import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import {PrismaClient as BlogPrismaClient} from '@prisma-blog/client'

@Injectable()
export class BlogPrismaService extends BlogPrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleDestroy() {
        await this.$connect()
    }
    async onModuleInit() {
        await this.$disconnect()
    }
}
