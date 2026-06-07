type CommentT = {
    questionId: string,
    authorId: string,
    author: {
        id: string,
        email: string,
        name: string,
    },
    id: string,
    createdAt: string,
    comment: string,
}