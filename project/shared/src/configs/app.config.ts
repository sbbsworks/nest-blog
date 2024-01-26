import {registerAs} from '@nestjs/config'
import { convertToBytes } from '../lib/file.validator'
import { validateConfig } from '../lib/config.validator'

const _appConfig = Object.freeze({
    USER_NAME_MIN_LENGTH: +(process.env.USER_NAME_MIN_LENGTH as string ?? undefined),
    USER_NAME_MAX_LENGTH: +(process.env.USER_NAME_MAX_LENGTH as string ?? undefined),
    USER_AVATAR_MAX_FILE_SIZE: convertToBytes(+(process.env.USER_AVATAR_MAX_FILE_SIZE as string ?? undefined)),
    USER_PASSWORD_MIN_LENGTH: +(process.env.USER_PASSWORD_MIN_LENGTH as string ?? undefined),
    USER_PASSWORD_MAX_LENGTH: +(process.env.USER_PASSWORD_MAX_LENGTH as string ?? undefined),

    POST_TITLE_MIN_LENGTH: +(process.env.POST_TITLE_MIN_LENGTH as string ?? undefined),
    POST_TITLE_MAX_LENGTH: +(process.env.POST_TITLE_MAX_LENGTH as string ?? undefined),
    POST_PHOTO_MAX_FILE_SIZE: convertToBytes(+(process.env.POST_PHOTO_MAX_FILE_SIZE as string ?? undefined)),
    POST_SPOILER_MIN_LENGTH: +(process.env.POST_SPOILER_MIN_LENGTH as string ?? undefined),
    POST_SPOILER_MAX_LENGTH: +(process.env.POST_SPOILER_MAX_LENGTH as string ?? undefined),
    POST_TEXT_MIN_LENGTH: +(process.env.POST_TEXT_MIN_LENGTH as string ?? undefined),
    POST_TEXT_MAX_LENGTH: +(process.env.POST_TEXT_MAX_LENGTH as string ?? undefined),
    POST_CITATION_MIN_LENGTH: +(process.env.POST_CITATION_MIN_LENGTH as string ?? undefined),
    POST_CITATION_MAX_LENGTH: +(process.env.POST_CITATION_MAX_LENGTH as string ?? undefined),
    POST_CITATION_AUTHOR_MIN_LENGTH: +(process.env.POST_CITATION_AUTHOR_MIN_LENGTH as string ?? undefined),
    POST_CITATION_AUTHOR_MAX_LENGTH: +(process.env.POST_CITATION_AUTHOR_MAX_LENGTH as string ?? undefined),
    POST_LINK_DESCRIPTION_MIN_LENGTH: +(process.env.POST_LINK_DESCRIPTION_MIN_LENGTH as string ?? undefined),
    POST_LINK_DESCRIPTION_MAX_LENGTH: +(process.env.POST_LINK_DESCRIPTION_MAX_LENGTH as string ?? undefined),
    POST_TAG_MIN_LENGTH: +(process.env.POST_TAG_MIN_LENGTH as string ?? undefined),
    POST_TAG_MAX_LENGTH: +(process.env.POST_TAG_MAX_LENGTH as string ?? undefined),
    POST_MAX_TAGS_ALLOWED: +(process.env.POST_MAX_TAGS_ALLOWED as string ?? undefined),

    POSTS_LIST_DEFAULT_LIMIT: +(process.env.POSTS_LIST_DEFAULT_LIMIT as string ?? undefined),
    POSTS_LIST_DEFAULT_OFFSET: +(process.env.POSTS_LIST_DEFAULT_OFFSET as string ?? undefined),

    POSTS_SEARCH_LIMIT: +(process.env.POSTS_SEARCH_LIMIT as string ?? undefined),

    COMMENT_TEXT_MIN_LENGTH: +(process.env.COMMENT_TEXT_MIN_LENGTH as string ?? undefined),
    COMMENT_TEXT_MAX_LENGTH: +(process.env.COMMENT_TEXT_MAX_LENGTH as string ?? undefined),

    COMMENTS_LIST_DEFAULT_LIMIT: +(process.env.COMMENTS_LIST_DEFAULT_LIMIT as string ?? undefined),
    COMMENTS_LIST_DEFAULT_OFFSET: +(process.env.COMMENTS_LIST_DEFAULT_OFFSET as string ?? undefined),
})
type TConfig = {[k: string] : string|number}

const appConfig = registerAs('appConfig', (): TConfig => _appConfig)

validateConfig(appConfig())

export {appConfig}
