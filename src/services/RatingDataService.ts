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
                title: "Oops! An error occurred...",
                text: "... while retrieving the rating of a competency questions. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async rate(stars: number, question_id: string, question_version: number): Promise<AxiosResponse<any, RatingT> | UXResponse> {
        if (stars < 1 || stars > 5) {
            return new Promise(() => {
                return {
                    title: "Oops! An error occurred...",
                    text: "The rating can only be between 1 and 5 stars.",
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
                title: "Oops! An error occurred...",
                text: "... while rating the competency question. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new RatingDataService();