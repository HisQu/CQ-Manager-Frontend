import http from "./httpCommon";
import authHeader from "./authHeader";
import { AxiosResponse } from "axios";

class TopicDataService {
    async getAllForProject(project_uuid: string): Promise<AxiosResponse<any, TopicT[]> | UXResponse> {
        return http.get<TopicT[]>(`/topics/${project_uuid}`, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: "Oops! An error occurred...",
                text: "... while retrieving catalogues. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async getOne(project_uuid: string, topic_uuid: string): Promise<AxiosResponse<any, TopicT> | UXResponse> {
        return http.get<TopicT>(`/topics/${project_uuid}/${topic_uuid}`, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: "Oops! An error occurred...",
                text: "... while retrieving the catalogue. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async add(project_uuid: string, name: string, identifier?: string): Promise<AxiosResponse<any, TopicT> | UXResponse> {
        return http.post<TopicT>(`/topics/${project_uuid}`, {
            name,
            ...(identifier ? { identifier } : {}),
        }, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: "Oops! An error occurred...",
                text: "... while creating the catalogue. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async update(project_uuid: string, topic_uuid: string, name: string): Promise<AxiosResponse<any, TopicT> | UXResponse> {
        return http.put<TopicT>(`/topics/${project_uuid}/${topic_uuid}`, { name }, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: "Oops! An error occurred...",
                text: "... while updating the catalogue. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async assignQuestion(project_uuid: string, topic_uuid: string, question_uuid: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.post(`/topics/${project_uuid}/${topic_uuid}/questions/${question_uuid}`, {}, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: "Oops! An error occurred...",
                text: "... while assigning the CQ to the catalogue. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async changeQuestion(project_uuid: string, topic_uuid: string, question_uuid: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.put(`/topics/${project_uuid}/${topic_uuid}/questions/${question_uuid}`, {}, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: "Oops! An error occurred...",
                text: "... while changing the CQ's catalogue. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async removeQuestion(project_uuid: string, question_uuid: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.delete(`/topics/${project_uuid}/questions/${question_uuid}`, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: "Oops! An error occurred...",
                text: "... while removing the CQ from its catalogue. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error" as const,
            }));
    }
}

export default new TopicDataService();
