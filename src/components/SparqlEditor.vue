<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

// ── Global one-time setup ─────────────────────────────────────────────────────

if (!(globalThis as any).__monacoEnvSet) {
  ;(globalThis as any).__monacoEnvSet = true
  ;(globalThis as any).MonacoEnvironment = {
    getWorker: () => new EditorWorker(),
  }
}

// LSP CompletionItemKind (1-indexed) → Monaco CompletionItemKind (0-indexed)
const LSP_KIND: Record<number, monaco.languages.CompletionItemKind> = {
  1: monaco.languages.CompletionItemKind.Text,
  2: monaco.languages.CompletionItemKind.Method,
  3: monaco.languages.CompletionItemKind.Function,
  4: monaco.languages.CompletionItemKind.Constructor,
  5: monaco.languages.CompletionItemKind.Field,
  6: monaco.languages.CompletionItemKind.Variable,
  7: monaco.languages.CompletionItemKind.Class,
  8: monaco.languages.CompletionItemKind.Interface,
  9: monaco.languages.CompletionItemKind.Module,
  10: monaco.languages.CompletionItemKind.Property,
  11: monaco.languages.CompletionItemKind.Unit,
  12: monaco.languages.CompletionItemKind.Value,
  13: monaco.languages.CompletionItemKind.Enum,
  14: monaco.languages.CompletionItemKind.Keyword,
  15: monaco.languages.CompletionItemKind.Snippet,
  16: monaco.languages.CompletionItemKind.Color,
  17: monaco.languages.CompletionItemKind.File,
  18: monaco.languages.CompletionItemKind.Reference,
  19: monaco.languages.CompletionItemKind.Folder,
  20: monaco.languages.CompletionItemKind.EnumMember,
  21: monaco.languages.CompletionItemKind.Constant,
  22: monaco.languages.CompletionItemKind.Struct,
  23: monaco.languages.CompletionItemKind.Event,
  24: monaco.languages.CompletionItemKind.Operator,
  25: monaco.languages.CompletionItemKind.TypeParameter,
}

// Registry: docUri → sendRequest, used by Monaco providers to route to the correct LSP instance
const lspRegistry: Map<string, (method: string, params: unknown) => Promise<any>> =
  ((globalThis as any).__sparqlLspRegistry ??= new Map())

function registerSparqlLanguage() {
  if (monaco.languages.getLanguages().some(l => l.id === 'sparql')) return

  monaco.languages.register({ id: 'sparql', extensions: ['.rq', '.sparql'] })

  monaco.languages.setLanguageConfiguration('sparql', {
    comments: { lineComment: '#' },
    brackets: [['{', '}'], ['(', ')'], ['[', ']']],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '[', close: ']' },
      { open: '"', close: '"', notIn: ['string'] },
      { open: "'", close: "'", notIn: ['string'] },
      { open: '<', close: '>' },
    ],
  })

  monaco.languages.setMonarchTokensProvider('sparql', {
    ignoreCase: true,
    keywords: [
      'SELECT', 'CONSTRUCT', 'DESCRIBE', 'ASK',
      'WHERE', 'FROM', 'NAMED', 'OPTIONAL', 'UNION', 'GRAPH',
      'FILTER', 'BIND', 'HAVING', 'GROUP', 'ORDER', 'BY', 'LIMIT', 'OFFSET',
      'ASC', 'DESC', 'DISTINCT', 'REDUCED',
      'PREFIX', 'BASE', 'INSERT', 'DELETE', 'WITH', 'USING',
      'CLEAR', 'DROP', 'CREATE', 'ADD', 'MOVE', 'COPY', 'LOAD',
      'DEFAULT', 'ALL', 'INTO', 'VALUES', 'UNDEF',
      'MINUS', 'SERVICE', 'SILENT', 'AS', 'NOT', 'IN', 'EXISTS',
    ],
    builtins: [
      'STR', 'LANG', 'LANGMATCHES', 'DATATYPE', 'BOUND', 'IRI', 'URI', 'BNODE',
      'RAND', 'ABS', 'CEIL', 'FLOOR', 'ROUND', 'CONCAT', 'STRLEN', 'UCASE', 'LCASE',
      'ENCODE_FOR_URI', 'CONTAINS', 'STRSTARTS', 'STRENDS', 'STRBEFORE', 'STRAFTER',
      'YEAR', 'MONTH', 'DAY', 'HOURS', 'MINUTES', 'SECONDS', 'TIMEZONE', 'TZ', 'NOW',
      'UUID', 'STRUUID', 'MD5', 'SHA1', 'SHA256', 'SHA384', 'SHA512',
      'COALESCE', 'IF', 'STRLANG', 'STRDT', 'SAMETERM',
      'ISIRI', 'ISURI', 'ISBLANK', 'ISLITERAL', 'ISNUMERIC',
      'REGEX', 'SUBSTR', 'REPLACE',
      'COUNT', 'SUM', 'MIN', 'MAX', 'AVG', 'SAMPLE', 'GROUP_CONCAT',
    ],
    tokenizer: {
      root: [
        [/#[^\r\n]*/, 'comment'],
        [/"""/, 'string', '@longstr_d'],
        [/'''/, 'string', '@longstr_s'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],
        [/<[^\s>]*>/, 'type'],
        [/_:[a-zA-Z0-9_]+/, 'variable.predefined'],
        [/[?$][a-zA-Z_][a-zA-Z0-9_]*/, 'variable'],
        [/[a-zA-Z_][a-zA-Z0-9_.%-]*:/, 'namespace'],
        [/[a-zA-Z_][a-zA-Z0-9_]*/, {
          cases: {
            '@keywords': 'keyword',
            '@builtins': 'predefined',
            '@default': 'identifier',
          },
        }],
        [/[+-]?\d*\.\d+([eE][+-]?\d+)?/, 'number.float'],
        [/[+-]?\d+/, 'number'],
        [/[{}()[\]]/, '@brackets'],
        [/[;,.]/, 'delimiter'],
        [/\^\^|&&|\|\||[!<>=+\-*/]/, 'operator'],
      ],
      longstr_d: [
        [/"""/, 'string', '@pop'],
        [/[^"]+/, 'string'],
        [/"/, 'string'],
      ],
      longstr_s: [
        [/'''/, 'string', '@pop'],
        [/[^']+/, 'string'],
        [/'/, 'string'],
      ],
    },
  } as monaco.languages.IMonarchLanguage)
}

function registerProviders() {
  if ((globalThis as any).__sparqlProvidersRegistered) return
  ;(globalThis as any).__sparqlProvidersRegistered = true

  monaco.languages.registerCompletionItemProvider('sparql', {
    triggerCharacters: [' ', '<', '?', ':'],
    async provideCompletionItems(model, position, ctx) {
      const client = lspRegistry.get(model.uri.toString())
      if (!client) return { suggestions: [] }
      try {
        const result = await client('textDocument/completion', {
          textDocument: { uri: model.uri.toString() },
          position: { line: position.lineNumber - 1, character: position.column - 1 },
          // Monaco trigger kind is 0-indexed; LSP is 1-indexed
          context: {
            triggerKind: ctx.triggerKind + 1,
            ...(ctx.triggerCharacter ? { triggerCharacter: ctx.triggerCharacter } : {}),
          },
        })
        if (!result) return { suggestions: [] }
        const items: any[] = Array.isArray(result) ? result : (result.items ?? [])
        const word = model.getWordUntilPosition(position)
        const defaultRange = {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }
        return {
          suggestions: items.map((item: any) => {
            const label = typeof item.label === 'string' ? item.label : (item.label?.label ?? '')
            const te = item.textEdit
            return {
              label,
              kind: LSP_KIND[item.kind as number] ?? monaco.languages.CompletionItemKind.Text,
              insertText: te?.newText ?? item.insertText ?? label,
              insertTextRules: item.insertTextFormat === 2
                ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                : undefined,
              detail: item.detail,
              documentation: typeof item.documentation === 'object'
                ? item.documentation?.value
                : item.documentation,
              range: te?.range
                ? {
                    startLineNumber: te.range.start.line + 1,
                    startColumn: te.range.start.character + 1,
                    endLineNumber: te.range.end.line + 1,
                    endColumn: te.range.end.character + 1,
                  }
                : defaultRange,
            }
          }),
        }
      } catch {
        return { suggestions: [] }
      }
    },
  })

  monaco.languages.registerHoverProvider('sparql', {
    async provideHover(model, position) {
      const client = lspRegistry.get(model.uri.toString())
      if (!client) return null
      try {
        const result = await client('textDocument/hover', {
          textDocument: { uri: model.uri.toString() },
          position: { line: position.lineNumber - 1, character: position.column - 1 },
        })
        if (!result?.contents) return null
        const raw = result.contents
        const contents: any[] = Array.isArray(raw) ? raw : [raw]
        return {
          contents: contents.map((c: any) => ({
            value: typeof c === 'string' ? c : (c.value ?? String(c)),
          })),
        }
      } catch {
        return null
      }
    },
  })
}

// ── Component instance ────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLDivElement>()
const docUri = `file:///sparql-${Math.random().toString(36).slice(2)}.rq`

let editor: monaco.editor.IStandaloneCodeEditor | null = null
let lsWorker: Worker | null = null
let themeObserver: MutationObserver | null = null
let docVersion = 1
let reqId = 0
let lspReady = false
let prevContent = ''
const pending = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>()

function sendRequest(method: string, params: unknown): Promise<any> {
  if (!lspReady) return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    const id = ++reqId
    const timer = setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id)
        resolve(null)
      }
    }, 3000)
    pending.set(id, {
      resolve: v => { clearTimeout(timer); resolve(v) },
      reject: e => { clearTimeout(timer); reject(e) },
    })
    lsWorker!.postMessage({ jsonrpc: '2.0', id, method, params })
  })
}

function sendNote(method: string, params: unknown) {
  lsWorker?.postMessage({ jsonrpc: '2.0', method, params })
}

function onWorkerMsg(e: MessageEvent) {
  const msg = e.data
  if (!msg || typeof msg !== 'object') return

  if (msg.type === 'ready') {
    startLsp()
    return
  }

  if ('id' in msg) {
    const cb = pending.get(msg.id)
    if (cb) {
      pending.delete(msg.id)
      msg.error ? cb.reject(msg.error) : cb.resolve(msg.result)
    }
    return
  }

  if (msg.method === 'textDocument/publishDiagnostics') {
    const model = editor?.getModel()
    if (!model) return
    monaco.editor.setModelMarkers(
      model,
      'sparql-ls',
      (msg.params.diagnostics as any[]).map((d: any) => ({
        severity:
          d.severity === 1 ? monaco.MarkerSeverity.Error :
          d.severity === 2 ? monaco.MarkerSeverity.Warning :
          monaco.MarkerSeverity.Info,
        startLineNumber: d.range.start.line + 1,
        startColumn: d.range.start.character + 1,
        endLineNumber: d.range.end.line + 1,
        endColumn: d.range.end.character + 1,
        message: d.message,
        source: 'qlue-ls',
      })),
    )
  }
}

async function startLsp() {
  const initId = ++reqId
  const initDone = new Promise<void>(resolve => {
    const timer = setTimeout(() => { pending.delete(initId); resolve() }, 5000)
    pending.set(initId, {
      resolve: () => { clearTimeout(timer); resolve() },
      reject: () => { clearTimeout(timer); resolve() },
    })
  })

  lsWorker!.postMessage({
    jsonrpc: '2.0',
    id: initId,
    method: 'initialize',
    params: {
      processId: null,
      rootUri: 'file:///',
      capabilities: {
        textDocument: {
          synchronization: { didSave: false },
          completion: { completionItem: { snippetSupport: true } },
          hover: { contentFormat: ['markdown', 'plaintext'] },
          publishDiagnostics: {},
        },
      },
      initializationOptions: {
        format: {
          alignPredicates: true,
          capitalizeKeywords: true,
          insertSpaces: true,
          tabSize: 2,
        },
        completion: {
          resultSizeLimit: 50,
          timeoutMs: 3000,
        },
        prefixes: { addMissing: true },
      },
      workspaceFolders: [{ uri: 'file:///', name: 'workspace' }],
    },
  })

  await initDone
  sendNote('initialized', {})
  lspReady = true
  prevContent = props.modelValue ?? ''

  sendNote('textDocument/didOpen', {
    textDocument: {
      uri: docUri,
      languageId: 'sparql',
      version: docVersion,
      text: prevContent,
    },
  })
}

onMounted(() => {
  if (!containerRef.value) return

  registerSparqlLanguage()
  registerProviders()

  const isDark = document.documentElement.classList.contains('dark')
  const model = monaco.editor.createModel(
    props.modelValue ?? '',
    'sparql',
    monaco.Uri.parse(docUri),
  )

  editor = monaco.editor.create(containerRef.value, {
    model,
    theme: isDark ? 'vs-dark' : 'vs',
    fontSize: 13,
    minimap: { enabled: false },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    readOnly: props.readonly ?? false,
    wordBasedSuggestions: 'off',
    suggest: { showWords: false },
  })

  editor.onDidChangeModelContent(() => {
    const val = editor!.getValue()
    emit('update:modelValue', val)
    if (lspReady) {
      docVersion++
      // qlue-ls uses incremental sync; send a range covering the entire previous document
      const prevLines = prevContent.split('\n')
      sendNote('textDocument/didChange', {
        textDocument: { uri: docUri, version: docVersion },
        contentChanges: [{
          range: {
            start: { line: 0, character: 0 },
            end: { line: prevLines.length - 1, character: prevLines[prevLines.length - 1].length },
          },
          text: val,
        }],
      })
      prevContent = val
    }
  })

  // Sync Monaco theme with app dark mode
  themeObserver = new MutationObserver(() => {
    monaco.editor.setTheme(
      document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
    )
  })
  themeObserver.observe(document.documentElement, { attributeFilter: ['class'] })

  lsWorker = new Worker(
    new URL('../workers/sparqlLs.worker.ts', import.meta.url),
    { type: 'module' },
  )
  lsWorker.addEventListener('message', onWorkerMsg)
  lspRegistry.set(docUri, sendRequest)
})

onUnmounted(() => {
  lspRegistry.delete(docUri)
  themeObserver?.disconnect()
  editor?.getModel()?.dispose()
  editor?.dispose()
  lsWorker?.terminate()
})

watch(
  () => props.modelValue,
  val => {
    if (editor && val !== editor.getValue()) {
      editor.setValue(val ?? '')
    }
  },
)

watch(
  () => props.readonly,
  val => editor?.updateOptions({ readOnly: val ?? false }),
)
</script>

<template>
  <div
    ref="containerRef"
    class="w-full rounded-md overflow-hidden border border-gray-300 dark:border-gray-600"
    style="height: 200px"
  />
</template>
