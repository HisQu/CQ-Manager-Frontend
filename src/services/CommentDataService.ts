import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import {AxiosResponse} from "axios";

class CommentDataService {
    async getAllForOneQuestion(questionId: string): Promise<AxiosResponse<any, CommentT> | UXResponse> {
        return http.get<CommentT[]>(`/comments/${questionId}`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingTheCommentsForACompetencyQuestion'),
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
                title: t('errorOccurred'),
                text: t('errorCommentingOnACompetencyQuestion'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    /** Marks all current comments of a competency question as read by the logged-in user. */
    async markRead(questionId: string): Promise<AxiosResponse<void> | UXResponse> {
        return http.post<void>(`/comments/${questionId}/read`, null, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorMarkingTheCommentsOfACompetencyQuestionAsRead'),
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new CommentDataService();