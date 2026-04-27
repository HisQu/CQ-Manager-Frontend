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
                    title: "Oops! These credentials seem to be invalid...",
                    text: "You may contact your system administrator for a password reset.",
                    detail: reason,
                    messageType: "warning"
                }
            } else {
                return {
                    title: "Oops! An error occurred...",
                    text: "... while logging in. Debugging info can be found in the console.",
                    detail: reason,
                    messageType: "error"
                }
            }
        });
    }
}

export default new LoginDataService();