import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import {AxiosResponse} from "axios";
import {useStore} from "../store.ts";

class RatingDataService {
    async getAllForOneQuestion(question_uuid: string): Promise<AxiosResponse<any, CompetencyQuestionT> | UXResponse> {
        return http.get<RatingT[]>(`/ratings/${question_uuid}`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingTheRatingOfACompetencyQuestions'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async rate(stars: number, question_id: string, question_version: number): Promise<AxiosResponse<any, RatingT> | UXResponse> {
        if (stars < 1 || stars > 5) {
            return new Promise(() => {
                return {
                    title: t('errorOccurred'),
                    text: t('invalidRating'),
                    messageType: "error"
                }
            })
        }

        const store = useStore()

        return http.post<RatingT>("/ratings/", {
                rating: stars,
                questionId: question_id,
                userId: store.getUser.id,
                version: question_version
            },
        { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRatingTheCompetencyQuestion'),
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new RatingDataService();