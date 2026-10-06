import type {VueWrapper} from '@vue/test-utils'

// Helpers for QuestionSelectorTable, wherever it is rendered.

/** Question texts of the rows currently shown in the table. */
export function visibleQuestions(wrapper: VueWrapper<any>): string[] {
  return wrapper.findAll('tbody [data-test="question"]').map(td => td.text())
}

/** The selection checkbox of the row showing `question`. */
export function rowCheckbox(wrapper: VueWrapper<any>, question: string) {
  const row = wrapper.findAll('tbody tr').find(tr => tr.text().includes(question))
  if (!row) throw new Error(`No row for "${question}"`)
  return row.find<HTMLInputElement>('input[type="checkbox"]')
}
