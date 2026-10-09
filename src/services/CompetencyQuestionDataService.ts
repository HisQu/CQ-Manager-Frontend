import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import {AxiosResponse} from "axios";

// Sends the ETag of the list the caller already shows; the backend answers an unchanged list with an empty 304.
function conditionalConfig(etag?: string) {
    return {
        headers: etag ? {...authHeader(), 'If-None-Match': etag} : authHeader(),
        validateStatus: (status: number) => (status >= 200 && status < 300) || status === 304,
    };
}

class CompetencyQuestionDataService {
    async getAll(): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse>  {
        return http.get<CompetencyQuestionT[]>(`/questions/`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingCompetencyQuestions'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getAllForOneGroup(group_uuid: string, etag?: string): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse>  {
        return http.get<CompetencyQuestionT[]>(`/questions/by_group/${group_uuid}`, conditionalConfig(etag)).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingCompetencyQuestions'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getAllForOneProject(project_uuid: string, etag?: string): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse> {
        const url = project_uuid !== "" ? `/questions/by_project/${project_uuid}` : `/questions`;
        return http.get<CompetencyQuestionT[]>(url, conditionalConfig(etag)).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorGettingTheGroupsForThisProject'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getUnifiedForProject(project_uuid: string, etag?: string): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse> {
        return http.get<CompetencyQuestionT[]>(`/questions/by_project/${project_uuid}/unified`, conditionalConfig(etag)).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingUnifiedCompetencyQuestions'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getUnifiedForGroup(group_uuid: string, etag?: string): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse> {
        return http.get<CompetencyQuestionT[]>(`/questions/by_group/${group_uuid}/unified`, conditionalConfig(etag)).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingUnifiedCompetencyQuestionsForThisGroup'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getOne(question_uuid: string): Promise<AxiosResponse<any, CompetencyQuestionT> | UXResponse> {
        return http.get<CompetencyQuestionT[]>(`/questions/${question_uuid}`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingTheCompetencyQuestions'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async add(question: string, group_uuid: string, comment?: string | null, meta?: {
        reference?: string | null,
        anchor?: string | null,
        exampleAnswer?: string | null,
        type?: CQType | null,
        tagIds?: string[],
    }): Promise<AxiosResponse<any, CompetencyQuestionT> | UXResponse> {
        return http.post<CompetencyQuestionT[]>(`/questions/by_group/${group_uuid}`, {
            question: question,
            ...(comment ? { comment } : {}),
            ...(meta ?? {}),
        }, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorAddingTheCompetencyQuestions'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getHistory(question_uuid: string): Promise<AxiosResponse<QuestionEventT[]> | UXResponse> {
        return http.get<QuestionEventT[]>(`/questions/${question_uuid}/history`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingTheHistory'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getDeletedForProject(project_uuid: string): Promise<AxiosResponse<CompetencyQuestionReducedT[]> | UXResponse> {
        return http.get<CompetencyQuestionReducedT[]>(`/questions/by_project/${project_uuid}/deleted`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingDeletedCompetencyQuestions'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async delete(question_uuid: string): Promise<AxiosResponse<any, DeleteResponse> | UXResponse> {
        return http.delete<DeleteResponse>(`/questions/${question_uuid}`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorDeletingTheCompetencyQuestion'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async change(question: string, annotations: AnnotationT[], question_uuid: string, sparqlQuery?: string | null, comment?: string | null, meta?: {
        reference?: string | null,
        anchor?: string | null,
        exampleAnswer?: string | null,
        type?: CQType | null,
    }): Promise<AxiosResponse<any, DeleteResponse> | UXResponse> {
        return http.put<DeleteResponse>(`/questions/${question_uuid}`, {
            question: question,
            annotations: annotations,
            sparqlQuery: sparqlQuery ?? null,
            comment: comment ?? null,
            ...(meta ?? {}),
        }, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorDeletingTheCompetencyQuestion'),
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new CompetencyQuestionDataService();