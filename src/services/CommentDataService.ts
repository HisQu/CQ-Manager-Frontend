import http from "./httpCommon";
import authHeader from "./authHeader";
import {AxiosResponse} from "axios";

class CommentDataService {
    async getAllForOneQuestion(questionId: string): Promise<AxiosResponse<any, CommentT> | UXResponse> {
        return http.get<CommentT[]>(`/comments/${questionId}`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while retrieving the comments for a competency question. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async comment(comment: string, questionId: string): Promise<AxiosResponse<any, CommentT> | UXResponse> {
        return http.post<CommentT>(`/comments`, {
                comment: comment,
                questionId: questionId
            },
            { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while commenting on a competency question. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new CommentDataService();