import {beforeEach, describe, expect, it, vi} from 'vitest'
import {flushPromises} from '@vue/test-utils'
import TagSelector from '../../src/components/TagSelector.vue'
import TagDataService from '../../src/services/TagDataService'
import {mountWithApp, lastEmitted} from '../helpers/mount'
import {apiError, ok} from '../helpers/api'

vi.mock('../../src/services/TagDataService', () => ({ default: { getAllForProject: vi.fn(), add: vi.fn() } }))

const urgent: TagT = { id: 't-urgent', name: 'urgent', projectId: 'p-1', noQuestions: 2 }
const archive: TagT = { id: 't-archive', name: 'Archive', projectId: 'p-1', noQuestions: 0 }

function mountSelector(modelValue: TagReducedT[] = []) {
  return mountWithApp(TagSelector, { props: { projectId: 'p-1', modelValue } }).wrapper
}

async function typeInto(wrapper: ReturnType<typeof mountSelector>, text: string) {
  const input = wrapper.get('input')
  await input.trigger('focus')
  await input.setValue(text)
  return input
}

const optionTexts = (wrapper: ReturnType<typeof mountSelector>) => wrapper.findAll('li').map(li => li.text())

describe('TagSelector', () => {
  beforeEach(() => {
    vi.mocked(TagDataService.getAllForProject).mockResolvedValue(ok([archive, urgent]) as any)
  })

  it('suggests matching project tags that are not selected yet', async () => {
    const wrapper = mountSelector([{ id: archive.id, name: archive.name }])
    await flushPromises()

    await typeInto(wrapper, 'ur')

    expect(optionTexts(wrapper)).toEqual([expect.stringContaining('#urgent'), 'Create tag #ur'])
  })

  it('selects an existing tag case-insensitively instead of offering to create a duplicate', async () => {
    const wrapper = mountSelector()
    await flushPromises()

    const input = await typeInto(wrapper, 'URGENT')
    expect(optionTexts(wrapper).some(text => text.startsWith('Create'))).toBe(false)
    await input.trigger('keydown', { key: 'Enter' })

    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual([[{ id: urgent.id, name: urgent.name }]])
    expect(TagDataService.add).not.toHaveBeenCalled()
  })

  it('creates and selects a new tag with a normalised name', async () => {
    vi.mocked(TagDataService.add).mockResolvedValue(ok({ id: 't-new', name: 'needs review', projectId: 'p-1', noQuestions: 0 }) as any)
    const wrapper = mountSelector()
    await flushPromises()

    const input = await typeInto(wrapper, '  needs   review ')
    await input.trigger('keydown', { key: 'Enter' })
    await flushPromises()

    expect(TagDataService.add).toHaveBeenCalledWith('p-1', 'needs review')
    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual([[{ id: 't-new', name: 'needs review' }]])
  })

  it('reports a failed creation and keeps the selection unchanged', async () => {
    vi.mocked(TagDataService.add).mockResolvedValue(apiError('A tag with this name already exists.'))
    const wrapper = mountSelector()
    await flushPromises()

    const input = await typeInto(wrapper, 'brand new')
    await input.trigger('keydown', { key: 'Enter' })
    await flushPromises()

    expect(lastEmitted(wrapper, 'error')?.[0]).toMatchObject({ messageType: 'error' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('removes the last tag on backspace in an empty input', async () => {
    const wrapper = mountSelector([{ id: archive.id, name: archive.name }, { id: urgent.id, name: urgent.name }])
    await flushPromises()

    await wrapper.get('input').trigger('keydown', { key: 'Backspace' })

    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual([[{ id: archive.id, name: archive.name }]])
  })

  it('is read-only when disabled', async () => {
    const wrapper = mountWithApp(TagSelector, {
      props: { projectId: 'p-1', modelValue: [{ id: urgent.id, name: urgent.name }], disabled: true },
    }).wrapper
    await flushPromises()

    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.text()).toContain('#urgent')
  })
})
