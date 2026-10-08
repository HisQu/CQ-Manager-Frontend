import { t } from '../i18n'
import http from "./httpCommon";
import authHeader from "./authHeader";
import { AxiosResponse } from "axios";

// Surfaces the backend's validation message (e.g. "A tag with this name already exists.") when there is one.
function tagError(action: string) {
    return (reason: any): UXResponse => ({
        title: t('errorOccurred'),
        text: reason?.response?.data?.detail
            ? t('tagErrorDetail', { action: t(action), detail: reason.response.data.detail })
            : t('tagErrorText', { action: t(action) }),
        detail: reason,
        messageType: "error" as const,
    });
}

class TagDataService {
    async getAllForProject(project_uuid: string): Promise<AxiosResponse<TagT[]> | UXResponse> {
        return http.get<TagT[]>(`/tags/${project_uuid}`, { headers: authHeader() })
            .then(r => r)
            .catch(tagError('tagRetrievingTags'));
    }

    async add(project_uuid: string, name: string): Promise<AxiosResponse<TagT> | UXResponse> {
        return http.post<TagT>(`/tags/${project_uuid}`, { name }, { headers: authHeader() })
            .then(r => r)
            .catch(tagError('tagCreatingTheTag'));
    }

    async rename(project_uuid: string, tag_uuid: string, name: string): Promise<AxiosResponse<TagT> | UXResponse> {
        return http.put<TagT>(`/tags/${project_uuid}/${tag_uuid}`, { name }, { headers: authHeader() })
            .then(r => r)
            .catch(tagError('tagRenamingTheTag'));
    }

    async delete(project_uuid: string, tag_uuid: string): Promise<AxiosResponse<void> | UXResponse> {
        return http.delete<void>(`/tags/${project_uuid}/${tag_uuid}`, { headers: authHeader() })
            .then(r => r)
            .catch(tagError('tagDeletingTheTag'));
    }

    async setQuestionTags(project_uuid: string, question_uuid: string, tag_uuids: string[]): Promise<AxiosResponse<CompetencyQuestionReducedT> | UXResponse> {
        return http.put<CompetencyQuestionReducedT>(`/tags/${project_uuid}/questions/${question_uuid}`, { tagIds: tag_uuids }, { headers: authHeader() })
            .then(r => r)
            .catch(tagError('tagSavingTheCqSTags'));
    }
}

export default new TagDataService();
