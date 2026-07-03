import { defineStore } from 'pinia'
import LoginDataService from "./services/LoginDataService.ts";

export const useStore = defineStore('cq-manager', {
    persist: true,

    state: (): StateT => ({
        user: {
            id: "",
            email: "",
            name: "",
            loggedInAt: null,
            accessToken: "",
            sessionValidUntil: null,
            isSystemAdmin: false,
        },
        project: {
            id: "",
            "name": "",
            "description": "",
            "noManagers": 0,
            "noEngineers": 0,
            "noGroups": 0,
            "noConsolidations": 0,
            "totalMembers": 0,
        },
        sidebarCollapsed: false,
        cqSelectedGroup: { id: '', name: 'No filter' },
        cqUnifiedView: true,
        cqExportFormat: 'markdown',
        cqExportFields: ["question", "type", "group", "comment", "reference", "exampleAnswer"],
    }),

    getters: {
        isLoggedIn(state): boolean { return !!state.user.loggedInAt },
        getemail(state): string { return state.user.email },
        getUser(state): UserT { return state.user },
        getProject(state): ProjectReducedT { return state.project },
        getCqSelectedGroup(state): { id: string, name: string } { return state.cqSelectedGroup },
        getCqUnifiedView(state): boolean { return state.cqUnifiedView },
    },

    actions: {
        logout() {
            this.user.loggedInAt = null;
        },
        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        },
        async login(email: string, password: string): Promise<boolean | UXResponse> {
            return LoginDataService.login(email, password).then(response => {
                if ("messageType" in response) {
                    return response
                } else {
                    this.user = {
                        id: response.data.id,
                        email: response.data.email,
                        name: response.data.name,
                        loggedInAt: new Date(),
                        accessToken: response.data.token,
                        sessionValidUntil: new Date(new Date().getDate() + 1),
                        isSystemAdmin: response.data.is_system_admin
                    }
                    return true
                }
            })
        }
    }
})