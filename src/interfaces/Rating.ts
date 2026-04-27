type RatingT = {
    id: string, // it is a UUID, but we treat it as a string
    aggregatedRating: number
    questionId: string
    author: UserReducedT
}
