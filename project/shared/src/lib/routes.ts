export enum EGatewayRouts {
    jwt = 'jwt',
    issue = 'issue',
    validate = 'validate',
    decode = 'decode',
    cookies = 'cookies',
    setCookies = 'set',
    readCookies = 'read',

    test = 'test'
}

export enum EUsersRouts {
    auth = 'auth',
    signup = 'signup',
    signin = 'signin',
    user = 'user',
    updatePassword = 'update-password',
    subscribeToNewPostsNotifier = 'subscribe-to-new-posts',
    postsHydrator = 'posts-hydrator',
    hydrator = 'hydrator',
}

export enum EBlogRouts {
    actions = 'actions',
    post = 'post',
    updatePost = 'update-post',
    rePublish = 'republish',
    deletePost = 'delete-post',
    repost = 'repost',
    like = 'like',
    deleteLike = 'delete-like',
    comment = 'comment',
    deleteComment = 'delete-comment',

    blog = 'blog',
    info = 'info',
    posts = 'posts',
    userPosts = 'user-posts',
    one = 'one',
    user = 'user',
    drafts = 'drafts',
    type = 'type',
    tag = 'tag',
    comments = 'comments',
    search = 'search',

    feed = 'feed',
    feedSubscribe = 'feed-subscribe',
    feedUnSubscribe = 'feed-un-subscribe',
}

export enum ERouteParams {
    userId = 'userId',
    postId = 'postId',
    likeId = 'likeId',
    commentId = 'commentId',
    offset = 'offset',
    limit = 'limit',
    sort = 'sort',
    postType = 'postType',
    postTag = 'postTag',
    keyphrase = 'keyphrase',
    jwt = 'jwt',
    token = 'token',
    interval = 'interval',
    youtubeVideoUrl = 'youtubeVideoUrl',
}
