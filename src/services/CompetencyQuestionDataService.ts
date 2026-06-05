import http from "./httpCommon";
import authHeader from "./authHeader";
import {AxiosResponse} from "axios";

class CompetencyQuestionDataService {
    async getAll(): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse>  {
        return http.get<CompetencyQuestionT[]>(`/questions/`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while retrieving competency questions. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getAllForOneGroup(group_uuid: string): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse>  {
        return http.get<CompetencyQuestionT[]>(`/questions/by_group/${group_uuid}`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while retrieving competency questions. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getAllForOneProject(project_uuid: string): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse> {
        const url = project_uuid !== "" ? `/questions/by_project/${project_uuid}` : `/questions`;
        return http.get<CompetencyQuestionT[]>(url, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while getting the groups for this project. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getUnifiedForProject(project_uuid: string): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse> {
        return http.get<CompetencyQuestionT[]>(`/questions/by_project/${project_uuid}/unified`, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while retrieving unified competency questions. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }

    async getUnifiedForGroup(group_uuid: string): Promise<AxiosResponse<any, CompetencyQuestionT[]> | UXResponse> {
        return http.get<CompetencyQuestionT[]>(`/questions/by_group/${group_uuid}/unified`, {headers: authHeader()}).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while retrieving unified competency questions for this group. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while retrieving the competency questions. Debugging info can be found in the console.",
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
    }): Promise<AxiosResponse<any, CompetencyQuestionT> | UXResponse> {
        return http.post<CompetencyQuestionT[]>(`/questions/by_group/${group_uuid}`, {
            question: question,
            ...(comment ? { comment } : {}),
            ...(meta ?? {}),
        }, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while adding the competency questions. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while deleting the competency question. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while deleting the competency question. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new CompetencyQuestionDataService();