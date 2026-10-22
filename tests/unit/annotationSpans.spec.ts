import {describe, expect, it} from 'vitest'
import {moveSpansThroughEdit, trimSpanWhitespace} from '../../src/utils/annotationSpans'

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

describe('moveSpansThroughEdit', () => {
  const text = 'Welche Pfründe erhielt der Petent?'
  const span = (content: string, occurrence = 0, source = text) => {
    let start = -1
    for (let index = 0; index <= occurrence; index += 1) start = source.indexOf(content, start + 1)
    return {content, start, end: start + content.length}
  }
  const annotations = [span('Pfründe'), span('Petent')]

  it('shifts spans after an insertion and keeps spans before it', () => {
    const edited = 'Welche Pfründe erhielt der arme Petent?'
    expect(moveSpansThroughEdit(text, edited, annotations)).toEqual([span('Pfründe', 0, edited), span('Petent', 0, edited)])
  })

  it('drops a span the edit touches and keeps the others', () => {
    expect(moveSpansThroughEdit(text, 'Welche Pfründe erhielt der Bittsteller?', annotations)).toEqual([span('Pfründe')])
    expect(moveSpansThroughEdit(text, 'Welche Pfrnde erhielt der Petent?', annotations)).toEqual([span('Petent', 0, 'Welche Pfrnde erhielt der Petent?')])
  })

  it('keeps a span when typing directly next to it', () => {
    expect(moveSpansThroughEdit(text, 'Welche Pfründen erhielt der Petent?', [span('Pfründe')])).toEqual([span('Pfründe')])
    const edited = 'Welche Pfründe erhielt der PPetent?'
    expect(moveSpansThroughEdit(text, edited, [span('Petent')])).toEqual([{content: 'Petent', start: 28, end: 34}])
  })

  it('handles a pasted replacement spanning several words', () => {
    const edited = 'Welche Ämter erhielt der Petent?'
    expect(moveSpansThroughEdit(text, edited, annotations)).toEqual([span('Petent', 0, edited)])
  })

  it('keeps each annotation on its own occurrence of a repeated word', () => {
    const source = 'Pfründe oder Pfründe?'
    const edited = 'Pfründe oder weitere Pfründe?'
    expect(moveSpansThroughEdit(source, edited, [span('Pfründe', 1, source)])).toEqual([span('Pfründe', 1, edited)])
  })

  it('counts UTF-16 code units like the stored offsets', () => {
    const edited = '📜 ' + text
    expect(moveSpansThroughEdit(text, edited, [span('Petent')])).toEqual([{content: 'Petent', start: 30, end: 36}])
  })
})
