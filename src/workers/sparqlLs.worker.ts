/// <reference lib="webworker" />
import init, { init_language_server, listen } from 'qlue-ls'

init().then(() => {
  const wasmInputStream = new TransformStream<string, string>()
  const wasmOutputStream = new TransformStream<string, string>()
  const wasmReader = wasmOutputStream.readable.getReader()
  const wasmWriter = wasmInputStream.writable.getWriter()

  const server = init_language_server(wasmOutputStream.writable.getWriter())
  listen(server, wasmInputStream.readable.getReader())

  self.onmessage = (e: MessageEvent) => {
    wasmWriter.write(JSON.stringify(e.data))
  }

  ;(async () => {
    while (true) {
      const { value, done } = await wasmReader.read()
      if (done) break
      self.postMessage(JSON.parse(value as string))
    }
  })()

  self.postMessage({ type: 'ready' })
})
