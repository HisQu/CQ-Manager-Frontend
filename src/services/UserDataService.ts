import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import { AxiosResponse } from "axios";

type ApiUserT = {
    email: string,
    name: string,
    is_system_admin: boolean,
    is_verified: boolean
}

class UserDataService {
    async getAll(): Promise<AxiosResponse<any, ApiUserT[]> | UXResponse> {
        return http.get<ApiUserT[]>("/users", { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingUsers'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async getOne(email: string): Promise<AxiosResponse<any, ApiUserT> | UXResponse> {
        return http.get<ApiUserT>(`/users/${encodeURIComponent(email)}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingTheUser'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async register(data: { email: string, name: string, password: string }): Promise<AxiosResponse<any, ApiUserT> | UXResponse> {
        return http.post<ApiUserT>("/users/register", data, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorCreatingTheUser'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async update(email: string, data: { email?: string | null, name?: string | null, password?: string | null, is_system_admin?: boolean | null, is_verified?: boolean | null }): Promise<AxiosResponse<any, ApiUserT> | UXResponse> {
        return http.put<ApiUserT>(`/users/${encodeURIComponent(email)}`, data, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorUpdatingTheUser'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async delete(email: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.delete(`/users/${encodeURIComponent(email)}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            const apiDetail: string | undefined = reason?.response?.data?.detail;
            return {
                title: t('deleteUserError'),
                text: apiDetail ?? t('deleteUserErrorText'),
                detail: "",
                messageType: "error"
            };
        });
    }

    async changePassword(current_password: string, new_password: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.put("/users/password", { current_password, new_password }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            const apiDetail: string | undefined = reason?.response?.data?.detail;
            return {
                title: t('changePasswordError'),
                text: apiDetail ?? t('changePasswordErrorText'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async verify(email: string): Promise<AxiosResponse<any, ApiUserT> | UXResponse> {
        return http.put<ApiUserT>(`/users/verify/${encodeURIComponent(email)}`, {}, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorVerifyingTheUser'),
                detail: reason,
                messageType: "error"
            };
        });
    }
}

export default new UserDataService();
