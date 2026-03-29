import { apiFetch } from "@/lib/api-client"

export type StreamChatParams = {
  message: string
  memberId: number
  sessionId: number
  onDelta: (delta: string) => void
}

export async function streamAiChat({
                                     message,
                                     memberId,
                                     sessionId,
                                     onDelta,
                                   }: StreamChatParams): Promise<void> {
  const res = await apiFetch("/ai/chat", {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ message, memberId, sessionId }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`AI chat failed: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""
  const emitChunk = (chunk: string) => {
    const lines = chunk.split(/\r?\n/)
    const dataLines: string[] = []

    for (const line of lines) {
      if (line.startsWith("data:")) {
        let data = line.slice(5)
        if (data.startsWith(" ")) {
          data = data.slice(1)
        }
        dataLines.push(data)
      }
    }

    if (dataLines.length > 0) {
      const data = dataLines.join("\n")
      if (data && data !== "[DONE]") {
        onDelta(data)
      }
      return
    }

    if (chunk.trim() !== "") {
      onDelta(chunk)
    }
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sepIndex = buffer.indexOf("\n\n")
    while (sepIndex !== -1) {
      const chunk = buffer.slice(0, sepIndex)
      buffer = buffer.slice(sepIndex + 2)
      emitChunk(chunk)

      sepIndex = buffer.indexOf("\n\n")
    }
  }

  const tail = buffer + decoder.decode()
  if (tail.trim() !== "") {
    emitChunk(tail)
  }
}
