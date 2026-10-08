type StateT = {
    user: UserT,
    project: ProjectReducedT,
    sidebarCollapsed: boolean,
    cqSelectedGroup: { id: string, name: string },
    cqUnifiedView: boolean,
    cqSelectedTopic: { id: string, identifier: string, name: string },
    cqSearchQuery: string,
    cqFilters: import('../utils/cqFilters').CqFilters,
    cqFiltersOpen: boolean,
    cqSort: import('../utils/cqSort').CqSort,
    cqExportFormat: 'markdown' | 'csv',
    cqExportFields: string[],
}