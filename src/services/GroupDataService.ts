import http from "./httpCommon";
import authHeader from "./authHeader";
import { AxiosResponse } from "axios";


class GroupDataService {

    async update(group_id: string, project_id: string, updatedData: { name?: string, members?: string[] }): Promise<AxiosResponse<any, GroupT> | UXResponse> {
        return http.put<GroupT>(`/groups/${project_id}/${group_id}`, updatedData, { headers: authHeader() })
            .then(response => {
                return response;
            }).catch(reason => {
                return {
                    title: "Oops! An error occurred...",
                    text: "... while updating the group. Debugging info can be found in the console.",
                    detail: reason,
                    messageType: "error"
                };
            });
    }
    
    async addMembers(group_id: string, project_id: string, members: string[]): Promise<AxiosResponse<any, GroupT> | UXResponse> {
        return http.put<GroupT>(`/groups/${project_id}/${group_id}/members/add`, { emails: members }, { headers: authHeader() })
            .then(() => {
                return {
                    title: "Added group member",
                    text: "Successfully added group member",
                    detail: "",
                    messageType: "success" as const,
                }
            }).catch(reason => {
                return {
                    title: "Oops! An error occurred...",
                    text: "... while adding members to the group. Debugging info can be found in the console.",
                    detail: reason,
                    messageType: "error"
                };
            });
    }
    
    async removeMembers(group_id: string, project_id: string, memberIds: string[]): Promise<AxiosResponse<any, GroupT> | UXResponse> {
        return http.put<GroupT>(`/groups/${project_id}/${group_id}/members/remove`, { ids: memberIds }, { headers: authHeader() })
            .then(() => {
                return {
                    title: "Removed group member",
                    text: "Successfully removed group member",
                    detail: "",
                    messageType: "success" as const,
                }
            }).catch(() => {
                return {
                    title: "Could not remove group member",
                    text: "An error occurred while removing the group member.",
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
                title: "Oops! An error occurred...",
                text: "... while retrieving groups. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while retrieving groups. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while retrieving groups. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while retrieving group. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while adding the group. Debugging info can be found in the console.",
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
                title: "Oops! An error occurred...",
                text: "... while deleting the group. Debugging info can be found in the console.",
                detail: reason,
                messageType: "error"
            }
        });
    }
}

export default new GroupDataService();