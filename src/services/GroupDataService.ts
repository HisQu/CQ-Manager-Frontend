import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import { AxiosResponse } from "axios";


class GroupDataService {

    async update(group_id: string, project_id: string, updatedData: { name?: string, emails?: string[], comment?: string | null }): Promise<AxiosResponse<any, GroupT> | UXResponse> {
        return http.put<GroupT>(`/groups/${project_id}/${group_id}`, updatedData, { headers: authHeader() })
            .then(response => {
                return response;
            }).catch(reason => {
                return {
                    title: t('errorOccurred'),
                    text: t('errorUpdatingTheGroup'),
                    detail: reason,
                    messageType: "error"
                };
            });
    }
    
    async addMembers(group_id: string, project_id: string, members: string[]): Promise<AxiosResponse<any, GroupT> | UXResponse> {
        return http.put<GroupT>(`/groups/${project_id}/${group_id}/members/add`, { emails: members }, { headers: authHeader() })
            .then(() => {
                return {
                    title: t('addedGroupMember'),
                    text: t('addedGroupMemberSuccess'),
                    detail: "",
                    messageType: "success" as const,
                }
            }).catch(reason => {
                return {
                    title: t('errorOccurred'),
                    text: t('errorAddingMembersToTheGroup'),
                    detail: reason,
                    messageType: "error"
                };
            });
    }
    
    async removeMembers(group_id: string, project_id: string, memberIds: string[]): Promise<AxiosResponse<any, GroupT> | UXResponse> {
        return http.put<GroupT>(`/groups/${project_id}/${group_id}/members/remove`, { ids: memberIds }, { headers: authHeader() })
            .then(() => {
                return {
                    title: t('removedGroupMember'),
                    text: t('removedGroupMemberSuccess'),
                    detail: "",
                    messageType: "success" as const,
                }
            }).catch(() => {
                return {
                    title: t('removeGroupMemberError'),
                    text: t('removeGroupMemberErrorText'),
                    detail: "",
                    messageType: "error" as const,
                }
            });
    }

    async getAll(): Promise<AxiosResponse<any, GroupT[]> | UXResponse>  {
        return http.get<GroupT[]>(`/groups/`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingGroups'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async getAllForOneProject(project_uuid: string): Promise<AxiosResponse<any, GroupT[]> | UXResponse>  {
        return http.get<GroupT[]>(`/groups/${project_uuid}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingGroups'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async getAllForOneProjectThatIBelongTo(project_uuid: string): Promise<AxiosResponse<any, GroupT[]> | UXResponse>  {
        return http.get<GroupT[]>(`/groups/my_groups/${project_uuid}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingGroups'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async getOne(group_id: string): Promise<AxiosResponse<any, GroupFullT> | UXResponse> {
        return http.get<GroupFullT>(`/groups/direct/${group_id}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingGroup'),
                detail: reason,
                messageType: "error"
            };
        });
    }
    async add(add: { name: string, members: string[], project_id: string }): Promise<AxiosResponse<any, GroupFullT> | UXResponse> {
        return http.post<GroupFullT>(`/groups/${add.project_id}`, {
            name: add.name,
            members: add.members
        }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorAddingTheGroup'),
                detail: reason,
                messageType: "error"
            };
        });
    }
    

    async delete(group_id: string, project_id: string): Promise<AxiosResponse<any, DeleteResponse> | UXResponse> {
        return http.delete<DeleteResponse>(`/groups/${project_id}/${group_id}`, { headers: authHeader() }).then(response => {
            return response
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorDeletingTheGroup'),
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new GroupDataService();