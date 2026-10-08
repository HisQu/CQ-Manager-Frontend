import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import {AxiosResponse} from "axios";

class ConsolidationDataService {
    async getAll(): Promise<AxiosResponse<any, ConsolidationReducedT[]> | UXResponse> {
        return http.get<ConsolidationReducedT[]>(`/consolidations/`, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingAllConsolidations'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getAllForOneProject(project_uuid: string): Promise<AxiosResponse<any, ConsolidationReducedT[]> | UXResponse> {
        return http.get<ConsolidationReducedT[]>(`/consolidations/${project_uuid}`, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingAllConsolidationsForAProject'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getOne(consolidation_uuid: string, project_uuid: string): Promise<AxiosResponse<ConsolidationT> | UXResponse> {
        return http.get<ConsolidationT>(`/consolidations/${project_uuid}/${consolidation_uuid}`, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingThisConsolidation'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async add(project_uuid: string, resultQuestion: { question: string; groupId: string; reference?: string | null; anchor?: string | null; exampleAnswer?: string | null; type?: CQType | null } | { id: string }, question_uuids: string[] = []): Promise<AxiosResponse<any, ConsolidationReducedT> | UXResponse> {
        return http.post<ConsolidationReducedT>(`/consolidations/${project_uuid}`, {
                targetQuestion: resultQuestion,
                sourceQuestionIds: question_uuids,
            }, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorAddingAConsolidation'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async update(consolidation_uuid: string, project_uuid: string, data: { targetQuestion: { id: string } | null }): Promise<AxiosResponse<any, ConsolidationReducedT> | UXResponse> {
        return http.put<ConsolidationReducedT>(`/consolidations/${project_uuid}/${consolidation_uuid}`, data, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorUpdatingThisConsolidation'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async delete(uuid: string, project_uuid: string): Promise<AxiosResponse<any, DeleteResponse> | UXResponse> {
        return http.delete<DeleteResponse>(`/consolidations/${project_uuid}/${uuid}`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorDeletingTheConsolidation'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async addQuestions(consolidation_uuid: string, project_uuid: string, question_uuids: string[]): Promise<AxiosResponse<any, ConsolidationReducedT> | UXResponse> {
        return http.put<ConsolidationReducedT>(`/consolidations/${project_uuid}/${consolidation_uuid}/questions/add`, {sourceQuestionIds: question_uuids}, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorAddingAQuestionToThisConsolidation'),
                detail: reason,
                messageType: "error"
            }
        });
    }

    async removeQuestions(consolidation_uuid: string, project_uuid: string, question_uuids: string[]): Promise<AxiosResponse<any, ConsolidationReducedT> | UXResponse> {
        return http.put<ConsolidationReducedT>(`/consolidations/${project_uuid}/${consolidation_uuid}/questions/remove`, {sourceQuestionIds: question_uuids}, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRemovingAQuestionFromThisConsolidation'),
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new ConsolidationDataService();
