export enum ELoggerMessages {
    badGateway = 'Bad Gateway',
    badRequest = 'Bad request',
    signUpBadGateway = 'Db error or user exists',
    signInBadGateway = 'Could not sign in',
    badCredentials = 'Bad credentials',
    couldNotAuthorize = 'Could not authorize',
    uploadFailure = 'Failed to upload',
    couldNotAddPost = 'Could not add post',
    notFound = 'Not found',
    passwordNotChanged = 'Password was not changed',
    coudNotSubscribe = 'Could not subscribe',
    coudNotUnSubscribe = 'Could not unsubscribe',
    invalidId = 'Not a valid id',
    addedToQueue = 'added to queue',
    willAddToQueue = 'will be added to queue',
    postWasNotUpdated = 'Post was not updated',
    postPublishingDateWasNotUpdated = 'Publishing date was not updated',
    couldNotDeletePost = 'Could not delete post',
    couldNotRepostPost = 'Could not repost post',
    couldNotAddLike = 'Could not add like',
    couldNotDeleteLike = 'Could not delete like',
    couldNotAddComment = 'Could not add comment',
    couldNotDeleteComment = 'Could not delete comment',
    alreadyExists = 'Already exists',
    invalidFeedRawRequestData = 'Invalid feed raw request data',
    couldNotGetFeed = 'Could not get feed',
    pgDuplicateItemCodeError = 'P2002',
}


/* 

        try {

        } catch (error) {
            throw new AppError({
                error,
                responseMessage: ELoggerMessages.badGateway,
                payload: {},
            })
        }

 */
