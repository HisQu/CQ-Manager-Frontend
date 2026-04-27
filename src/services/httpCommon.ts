import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-type": "application/json"
    }
});

axiosInstance.interceptors.response.use(response => {
    if (response.headers) {
        console.log("headers", response.headers)
        const isTrue = (v: string | undefined) => v?.toLowerCase() === 'true';
        try {
            response.data.permissionsGroupMember = isTrue(response.headers['permissions-group-member']);
            response.data.permissionsProjectManager = isTrue(response.headers['permissions-project-manager']);
            response.data.permissionsProjectEngineer = isTrue(response.headers['permissions-project-engineer']);
            response.data.permissionsProjectMember = isTrue(response.headers['permissions-project-member']);
        }
        catch (e) {
            console.log("Cannot assign permission headers to data.")
        }
    }
    return response;
}, error => {
    // Handle response error
    return Promise.reject(error);
});

export default axiosInstance;