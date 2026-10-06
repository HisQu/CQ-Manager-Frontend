import type {AxiosResponse} from 'axios'

/** A successful service response, as returned by the data services in src/services. */
export function ok<T>(data: T, permissions: Partial<Record<
  'permissionsGroupMember' | 'permissionsProjectManager' | 'permissionsProjectEngineer' | 'permissionsProjectMember', boolean
>> = {}): AxiosResponse<T> {
  const body = Array.isArray(data) ? Object.assign([...data], permissions) : { ...data, ...permissions }
  return { data: body as T, status: 200, statusText: 'OK', headers: {}, config: {} as any }
}

/** A failed service response (the UXResponse branch of the service union type). */
export function apiError(text = 'Something went wrong'): UXResponse {
  return { title: 'Oops! An error occurred...', text, detail: '', messageType: 'error' }
}
