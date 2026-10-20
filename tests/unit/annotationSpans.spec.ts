import {describe, expect, it} from 'vitest'
import {trimSpanWhitespace} from '../../src/utils/annotationSpans'

describe('trimSpanWhitespace', () => {
  const text = 'Welche Pfründe erhielt der Petent?'

  it('drops the trailing space of a double-clicked word', () => {
    expect(trimSpanWhitespace(text, 7, 15)).toEqual({ start: 7, end: 14 })
  })

  it('drops leading whitespace and newlines', () => {
    expect(trimSpanWhitespace(' \nPfründe ', 0, 10)).toEqual({ start: 2, end: 9 })
  })

  it('leaves an already tight span unchanged', () => {
    expect(trimSpanWhitespace(text, 7, 14)).toEqual({ start: 7, end: 14 })
  })

  it('collapses a whitespace-only span', () => {
    expect(trimSpanWhitespace(text, 6, 7)).toEqual({ start: 7, end: 7 })
  })
})
