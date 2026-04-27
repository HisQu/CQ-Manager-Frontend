import http from "./httpCommon";
import authHeader from "./authHeader";
import {AxiosResponse} from "axios";

class ConsolidationDataService {
    async getAll(): Promise<AxiosResponse<any, ConsolidationT[]> | UXResponse> {
        return http.get<ConsolidationT[]>(`/consolidations/`, {headers: authHeader()}).then(response => {
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

    async getAllForOneProject(project_uuid: string): Promise<AxiosResponse<any, ConsolidationT[]> | UXResponse> {
        return http.get<ConsolidationT[]>(`/consolidations/${project_uuid}`, {headers: authHeader()}).then(response => {
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

    async getOne(question_uuid: string, project_uuid: string): Promise<AxiosResponse<any, ConsolidationT> | UXResponse> {
        return http.get<ConsolidationT>(`/consolidations/${project_uuid}/${question_uuid}`, {headers: authHeader()}).then(response => {
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

    async add(name: string, project_uuid: string, question_uuids: string[]): Promise<AxiosResponse<any, ConsolidationT> | UXResponse> {
        return http.post<ConsolidationT>(`/consolidations/${project_uuid}`,  {
                name: name,
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

    async addQuestions(consolidation_uuid: string, project_uuid: string, question_uuids: string[]): Promise<AxiosResponse<any, DeleteResponse> | UXResponse> {
        return http.put<DeleteResponse>(`/consolidations/${project_uuid}/${consolidation_uuid}/questions/add`, {ids: question_uuids}, { headers: authHeader() }).then(response => {
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

    async removeQuestions(consolidation_uuid: string, project_uuid: string, question_uuids: string[]): Promise<AxiosResponse<any, DeleteResponse> | UXResponse> {
        return http.put<DeleteResponse>(`/consolidations/${project_uuid}/${consolidation_uuid}/questions/remove`, {ids: question_uuids}, { headers: authHeader() }).then(response => {
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