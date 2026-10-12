import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import { AxiosResponse } from "axios";

class ProjectDataService {

    async update(project_id: string, updatedData: { name: string, managers: string[], engineers: string[] }): Promise<AxiosResponse<any, ProjectReducedT> | UXResponse> {
        return http.put<ProjectReducedT>(`/projects/${project_id}`, updatedData, { headers: authHeader() })
            .then(response => {
                return response;
            })
            .catch(reason => {
                return {
                    title: t('errorOccurred'),
                    text: t('errorUpdatingTheProject'),
                    detail: reason,
                    messageType: "error"
                };
            });
    }



    async addManagers(project_id: string, emails: string[]): Promise<AxiosResponse<any, ProjectReducedT> | UXResponse> {
        return http.put<ProjectReducedT>(`/projects/${project_id}/managers/add`, {
            emails: emails
        }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRemovingManagers'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async addEngineers(project_id: string, emails: string[]): Promise<AxiosResponse<any, ProjectReducedT> | UXResponse> {
        return http.put<ProjectReducedT>(`/projects/${project_id}/engineers/add`, {
            emails: emails
        }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRemovingEngineers'),
                detail: reason,
                messageType: "error"
            };
        });
    }
    
    async removeManagers(project_id: string, ids: string[]): Promise<AxiosResponse<any, ProjectReducedT> | UXResponse> {
        return http.put<ProjectReducedT>(`/projects/${project_id}/managers/remove`, {
            ids: ids
        }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRemovingManagers'),
                detail: reason,
                messageType: "error"
            };
        });
    }
    
    async removeEngineers(project_id: string, ids: string[]): Promise<AxiosResponse<any, ProjectReducedT> | UXResponse> {
        return http.put<ProjectReducedT>(`/projects/${project_id}/engineers/remove`, {
            ids: ids
        }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRemovingEngineers'),
                detail: reason,
                messageType: "error"
            };
        });
    }
      
    async getAll(): Promise<AxiosResponse<any, ProjectReducedT[]> | UXResponse>  {
        return http.get<ProjectReducedT[]>("/projects/", { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingProjects'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async getOne(project_id: string): Promise<AxiosResponse<any, ProjectFullT> | UXResponse> {
        return http.get<ProjectFullT>(`/projects/${project_id}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingProject'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async add(add: { name: string, managers: string[], engineers: string[] }): Promise<AxiosResponse<any, ProjectReducedT> | UXResponse> {
        return http.post<ProjectReducedT>(`/projects/`, {
            name: add.name,
            managers: add.managers,
            engineers: add.engineers
        }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorAddingTheProject'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async delete(project_id: string): Promise<AxiosResponse<any, DeleteResponse> | UXResponse> {
        return http.delete<DeleteResponse>(`/projects/${project_id}`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorDeletingTheProject'),
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new ProjectDataService();