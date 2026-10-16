import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import { AxiosResponse } from "axios";


class TermDataService {
    async getAll(): Promise<AxiosResponse<any, TermT[]> | UXResponse>  {
        return http.get<TermT[]>(`/terms/`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingTerms'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async getAllForOneProject(project_uuid: string): Promise<AxiosResponse<any, TermT[]> | UXResponse>  {
        return http.get<TermT[]>(`/terms/project/${project_uuid}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorRetrievingTerms'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async getQuestionsThatThisTermOccursIn(project_id: string, term_id: string): Promise<AxiosResponse<any, CompetencyQuestionReferenceT> | UXResponse> {
        return http.get<CompetencyQuestionReferenceT>(`/terms/${project_id}/${term_id}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorTheQuestionsATermBelongsTo'),
                detail: reason,
                messageType: "error"
            };
        });
    }
    async createTerm(project_id: string, content: string, definition?: string | null, conceptIri?: string | null): Promise<AxiosResponse<TermT> | UXResponse> {
        return http.post<TermT>(`/terms/project/${project_id}`, {content, definition: definition ?? null, conceptIri: conceptIri ?? null}, { headers: authHeader() }).then(response => response).catch(reason => ({
            title: t('errorOccurred'),
            text: t('errorAddingTheTerm'),
            detail: reason,
            messageType: "error" as const,
        }));
    }

    async saveAnnotationVersion(question_id: string, revision_id: string, base_annotation_version_id: string | null, annotations: AnnotationT[]): Promise<AxiosResponse<AnnotationVersionSaveT> | UXResponse> {
        return http.put<AnnotationVersionSaveT>(`/terms/question/${question_id}/revisions/${revision_id}/annotations`, {
            baseAnnotationVersionId: base_annotation_version_id,
            annotations,
        }, { headers: authHeader() }).then(response => response).catch(reason => ({
            title: t('errorOccurred'),
            text: t('errorSavingAnnotations'),
            detail: reason,
            messageType: "error" as const,
        }));
    }
    

    async update(project_id: string, term_id: string, content: string, definition?: string | null, conceptIri?: string | null): Promise<AxiosResponse<any, TermT> | UXResponse> {
        return http.put<TermT>(`/terms/${project_id}/${term_id}`, { content, definition, conceptIri }, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorUpdatingTheTerm'),
                detail: reason,
                messageType: "error"
            };
        });
    }

    async deleteTerm(project_id: string, term_id: string): Promise<AxiosResponse<any, any> | UXResponse> {
        return http.delete(`/terms/${project_id}/${term_id}`, { headers: authHeader() }).then(response => {
            return response;
        }).catch(reason => {
            return {
                title: t('errorOccurred'),
                text: t('errorDeletingTheTerm'),
                detail: reason,
                messageType: "error"
            };
        });
    }

}

export default new TermDataService();
