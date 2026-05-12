import axios from "axios";

console.log('[httpCommon] VITE_API_URL =', import.meta.env.VITE_API_URL);
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-type": "application/json"
    }
});

axiosInstance.interceptors.response.use(response => {
    if (response.headers) {
        const isTrue = (v: string | undefined) => v?.toLowerCase() === 'true';
        try {
            response.data.permissionsGroupMember = isTrue(response.headers['permissions-group-member']);
            response.data.permissionsProjectManager = isTrue(response.headers['permissions-project-manager']);
            response.data.permissionsProjectEngineer = isTrue(response.headers['permissions-project-engineer']);
            response.data.permissionsProjectMember = isTrue(response.headers['permissions-project-member']);
        }
        catch (e) {
            return Promise.reject({
                title: "Permission headers error",
                text: "Could not read permission headers from the server response.",
                detail: String(e),
                messageType: "error"
            } satisfies UXResponse);
        }
    }
    return response;
}, error => {
    // Handle response error
    return Promise.reject(error);
});

export default axiosInstance;