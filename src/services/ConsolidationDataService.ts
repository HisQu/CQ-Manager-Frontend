import http from "./httpCommon";
import authHeader from "./authHeader";
import {AxiosResponse} from "axios";

class ConsolidationDataService {
    async getAll(): Promise<AxiosResponse<any, ConsolidationReducedT[]> | UXResponse> {
        return http.get<ConsolidationReducedT[]>(`/consolidations/`, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while retrieving all consolidations. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while retrieving all consolidations for a project. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while retrieving this consolidation. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async add(project_uuid: string, resultQuestion: { question: string } | { id: string }, question_uuids: string[] = []): Promise<AxiosResponse<any, ConsolidationReducedT> | UXResponse> {
        return http.post<ConsolidationReducedT>(`/consolidations/${project_uuid}`, {
                resultQuestion,
                ids: question_uuids,
            }, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while adding a consolidation. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async update(consolidation_uuid: string, project_uuid: string, data: { resultQuestionId: string | null }): Promise<AxiosResponse<any, ConsolidationReducedT> | UXResponse> {
        return http.put<ConsolidationReducedT>(`/consolidations/${project_uuid}/${consolidation_uuid}`, data, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while updating this consolidation. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while deleting the consolidation. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async addQuestions(consolidation_uuid: string, project_uuid: string, question_uuids: string[]): Promise<AxiosResponse<any, ConsolidationReducedT> | UXResponse> {
        return http.put<ConsolidationReducedT>(`/consolidations/${project_uuid}/${consolidation_uuid}/questions/add`, {ids: question_uuids}, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while adding a question to this consolidation. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async removeQuestions(consolidation_uuid: string, project_uuid: string, question_uuids: string[]): Promise<AxiosResponse<any, ConsolidationReducedT> | UXResponse> {
        return http.put<ConsolidationReducedT>(`/consolidations/${project_uuid}/${consolidation_uuid}/questions/remove`, {ids: question_uuids}, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while removing a question from this consolidation. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new ConsolidationDataService();
