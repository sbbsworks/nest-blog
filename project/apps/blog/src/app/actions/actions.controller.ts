import {Body, Controller} from '@nestjs/common'
import {AddCommentRDO, AddLikeDTO, AddPostRDO, CommentDTO, DeleteCommentDTO, DeleteCommentRDO, DeleteLikeDTO, DeleteLikeRDO, DeletePostDTO, DeletePostRDO, EBlogRouts, PostDTO, RePostDTO, RePostRDO, RePublishPostDateDTO, UpdatePostDTO, UpdatePostRDO} from '@shared'
import {ActionsService} from './actions.service'
import {EventPattern} from '@nestjs/microservices'

@Controller()
export class ActionsController {
    constructor(private readonly actionsService: ActionsService) {}

    @EventPattern(EBlogRouts.post)
    async addPost(@Body() data: PostDTO): Promise<AddPostRDO> {
        return await this.actionsService.addPost(data)
    }

    @EventPattern(EBlogRouts.updatePost)
    async editPost(@Body() data: UpdatePostDTO): Promise<UpdatePostRDO> {
        return await this.actionsService.editPost(data)
    }

    @EventPattern(EBlogRouts.rePublish)
    async rePublishPost(@Body() data: RePublishPostDateDTO): Promise<UpdatePostRDO> {
        return await this.actionsService.rePublishPost(data)
    }

    @EventPattern(EBlogRouts.deletePost)
    async delete(@Body() data: DeletePostDTO): Promise<DeletePostRDO> {
        return await this.actionsService.deletePost(data)
    }

    @EventPattern(EBlogRouts.repost)
    async repost(@Body() data: RePostDTO): Promise<RePostRDO> {
        return await this.actionsService.repost(data)
    }

    @EventPattern(EBlogRouts.like)
    async addLike(@Body() data: AddLikeDTO) {
        return await this.actionsService.addLike(data)
    }

    @EventPattern(EBlogRouts.deleteLike)
    async deleteLike(@Body() data: DeleteLikeDTO): Promise<DeleteLikeRDO> {
        return await this.actionsService.deleteLike(data)
    }

    @EventPattern(EBlogRouts.comment)
    async addComment(@Body() data: CommentDTO): Promise<AddCommentRDO> {
        return await this.actionsService.addComment(data)
    }

    @EventPattern(EBlogRouts.deleteComment)
    async deleteComment(@Body() data: DeleteCommentDTO): Promise<DeleteCommentRDO> {
        return await this.actionsService.deleteComment(data)
    }
}
