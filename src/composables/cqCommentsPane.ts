import {onBeforeUnmount, ref, type InjectionKey, type Ref} from 'vue'

export type CqCommentsLayout = { expanded: Ref<boolean>; docked: Ref<boolean> }
export const cqCommentsPaneKey: InjectionKey<CqCommentsLayout> = Symbol('cqCommentsPane')

// Leave at least 640px for the CQ itself after navigation, comments, gutters and scrollbar.
// A short viewport also needs the inline layout to leave room for the composer and discussion.
export const CQ_COMMENTS_DOCK_QUERY = '(min-width: 1280px) and (min-height: 640px)'
// Both expanded panes need 288px + 384px, plus gutters and at least 640px of CQ content.
export const CQ_COMMENTS_COEXIST_QUERY = '(min-width: 1440px) and (min-height: 640px)'

function useMediaQuery(query: string) {
  const media = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query) : null
  const docked = ref(media?.matches ?? false)
  const update = (event: MediaQueryListEvent) => { docked.value = event.matches }
  media?.addEventListener('change', update)
  onBeforeUnmount(() => media?.removeEventListener('change', update))
  return docked
}

export function useCqCommentsDocking() {
  return useMediaQuery(CQ_COMMENTS_DOCK_QUERY)
}

export function useCqCommentsCoexistence() {
  return useMediaQuery(CQ_COMMENTS_COEXIST_QUERY)
}
