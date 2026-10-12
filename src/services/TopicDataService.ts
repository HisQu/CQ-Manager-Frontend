import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import { AxiosResponse } from "axios";

class TopicDataService {
    async getAllForProject(project_uuid: string): Promise<AxiosResponse<any, TopicT[]> | UXResponse> {
        return http.get<TopicT[]>(`/topics/${project_uuid}`, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: t('errorOccurred'),
                text: t('errorRetrievingCatalogues'),
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async getOne(project_uuid: string, topic_uuid: string): Promise<AxiosResponse<any, TopicT> | UXResponse> {
        return http.get<TopicT>(`/topics/${project_uuid}/${topic_uuid}`, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: t('errorOccurred'),
                text: t('errorRetrievingTheCatalogue'),
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
                title: t('errorOccurred'),
                text: t('errorCreatingTheCatalogue'),
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async update(project_uuid: string, topic_uuid: string, name: string): Promise<AxiosResponse<any, TopicT> | UXResponse> {
        return http.put<TopicT>(`/topics/${project_uuid}/${topic_uuid}`, { name }, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: t('errorOccurred'),
                text: t('errorUpdatingTheCatalogue'),
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async assignQuestion(project_uuid: string, topic_uuid: string, question_uuid: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.post(`/topics/${project_uuid}/${topic_uuid}/questions/${question_uuid}`, {}, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: t('errorOccurred'),
                text: t('errorAssigningTheCqToTheCatalogue'),
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async changeQuestion(project_uuid: string, topic_uuid: string, question_uuid: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.put(`/topics/${project_uuid}/${topic_uuid}/questions/${question_uuid}`, {}, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: t('errorOccurred'),
                text: t('errorChangingTheCqSCatalogue'),
                detail: reason,
                messageType: "error" as const,
            }));
    }

    async removeQuestion(project_uuid: string, question_uuid: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.delete(`/topics/${project_uuid}/questions/${question_uuid}`, { headers: authHeader() })
            .then(r => r)
            .catch(reason => ({
                title: t('errorOccurred'),
                text: t('errorRemovingTheCqFromItsCatalogue'),
                detail: reason,
                messageType: "error" as const,
            }));
    }
}

export default new TopicDataService();
