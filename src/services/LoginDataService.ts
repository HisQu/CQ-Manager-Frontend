import { t } from '../i18n'
import http from "./httpCommon";
import {AxiosResponse} from "axios";

class LoginDataService {
    async login(email: string, password: string): Promise<AxiosResponse<any, {
        id: string,
        email: string,
        name: string,
        is_system_admin: boolean,
        is_verified: boolean,
        token: string
    }> | UXResponse> {
        return http.post<{
            id: string,
            email: string,
            name: string,
            is_system_admin: boolean,
            is_verified: boolean,
            token: string
        }>("/users/login", {
            email: email,
            password: password
        }).then(response => {
            return response
        }).catch(reason => {
            console.log("Debug info for error:");
            console.log(reason);
            if (reason.status === 401) {
                return {
                    title: t('invalidCredentials'),
                    text: t('contactAdminPasswordReset'),
                    detail: reason,
                    messageType: "warning"
                }
            } else {
                return {
                    title: t('errorOccurred'),
                    text: t('errorLoggingIn'),
                    detail: reason,
                    messageType: "error"
                }
            }
        });
    }
}

export default new LoginDataService();