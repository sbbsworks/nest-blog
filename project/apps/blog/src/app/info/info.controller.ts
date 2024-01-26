import {Body, Controller} from '@nestjs/common'
import {CommentsPaginationDTO, EBlogRouts, PostIdDTO, PostKeyphraseDTO, PostTagDTO, PostTypeDTO, ReturnedCommentRDO, ReturnedPostRDO, SortedPaginationDTO, TUserId, UserPostsDTO} from '@shared'
import {InfoService} from './info.service'
import {EventPattern} from '@nestjs/microservices'

@Controller()
export class InfoController {
    constructor(private readonly infoService: InfoService) {}

    @EventPattern(EBlogRouts.one)
    async findOnePost(@Body() data: PostIdDTO): Promise<ReturnedPostRDO> {
        return await this.infoService.findOnePost(data)
    }

    @EventPattern(EBlogRouts.posts)
    async listPosts(@Body() data: SortedPaginationDTO): Promise<ReturnedPostRDO[]> {
        return await this.infoService.listPosts(data)
    }

    @EventPattern(EBlogRouts.userPosts)
    async listUserPosts(@Body() data: UserPostsDTO): Promise<ReturnedPostRDO[]> {
        return await this.infoService.listUserPosts(data)
    }

    @EventPattern(EBlogRouts.drafts)
    async listUserDrafts(@Body() data: TUserId): Promise<ReturnedPostRDO[]> {
        return await this.infoService.listUserDrafts(data)
    }

    @EventPattern(EBlogRouts.type)
    async listPostsByType(@Body() postType: PostTypeDTO): Promise<ReturnedPostRDO[]> {
        return await this.infoService.listPostsByType(postType)
    }

    @EventPattern(EBlogRouts.tag)
    async listPostsByTag(@Body() postTag: PostTagDTO): Promise<ReturnedPostRDO[]> {
        return await this.infoService.listPostsByTag(postTag)
    }

    @EventPattern(EBlogRouts.comments)
    async listPostComments(@Body() data: CommentsPaginationDTO): Promise<ReturnedCommentRDO[]> {
        return await this.infoService.listPostComments(data)
    }

    @EventPattern(EBlogRouts.search)
    async searchPosts(@Body() keyphrase: PostKeyphraseDTO): Promise<ReturnedPostRDO[]> {
        return await this.infoService.searchPosts(keyphrase)
    }
}
