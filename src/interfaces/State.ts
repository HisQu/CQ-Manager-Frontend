type StateT = {
    user: UserT,
    project: ProjectReducedT,
    sidebarCollapsed: boolean,
    cqSelectedGroup: { id: string, name: string },
    cqUnifiedView: boolean,
}