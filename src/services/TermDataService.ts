import http from "./httpCommon";
import authHeader from "./authHeader";
import { AxiosResponse } from "axios";


class TermDataService {
    async getAll(): Promise<AxiosResponse<any, TermT[]> | UXResponse>  {
        return http.get<TermT[]>(`/terms/`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while retrieving terms. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            };
        });
    }

    async getAllForOneProject(project_uuid: string): Promise<AxiosResponse<any, TermT[]> | UXResponse>  {
        return http.get<TermT[]>(`/terms/project/${project_uuid}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while retrieving terms. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            };
        });
    }

    async getQuestionsThatThisTermOccursIn(project_id: string, term_id: string): Promise<AxiosResponse<any, CompetencyQuestionReferenceT> | UXResponse> {
        return http.get<CompetencyQuestionReferenceT>(`/terms/${project_id}/${term_id}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while the questions a term belongs to. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            };
        });
    }
    async add(question_id: string, annotations: AnnotationT[]): Promise<AxiosResponse<any, GroupFullT> | UXResponse> {
        return http.put<DeleteResponse>(`/terms/add/${question_id}`, {
            annotations: annotations
        }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while adding the term. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            };
        });
    }
    

    async update(project_id: string, term_id: string, content: string): Promise<AxiosResponse<any, TermT> | UXResponse> {
        return http.put<TermT>(`/terms/${project_id}/${term_id}`, { content }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while updating the term. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            };
        });
    }

    async deleteTerm(project_id: string, term_id: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.delete(`/terms/${project_id}/${term_id}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while deleting the term. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            };
        });
    }

    async remove(term_id: string, passage_id: string, question_id: string): Promise<AxiosResponse<any, DeleteResponse> | UXResponse> {
        return http.put<DeleteResponse>(`/terms/remove/${question_id}`,{
            termIds: [term_id],
            passageIds: [passage_id],
        },{
            headers: authHeader(),
        }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: "Oops! An error occurred...",
                text: "... while removing the term. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new TermDataService();