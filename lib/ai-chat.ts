import { apiFetch } from "@/lib/api-client"

export type StreamChatParams = {
  message: string
  memberId: number
  onDelta: (delta: string) => void
}

export async function streamAiChat({
                                     message,
                                     memberId,
                                     onDelta,
                                   }: StreamChatParams): Promise<void> {
  const res = await apiFetch("/ai/chat", {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ message, memberId }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`AI chat failed: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sepIndex = buffer.indexOf("\n\n")
    while (sepIndex !== -1) {
      const chunk = buffer.slice(0, sepIndex)
      buffer = buffer.slice(sepIndex + 2)

      const lines = chunk.split("\n")
      for (const line of lines) {
        if (line.startsWith("data:")) {
          const data = line.slice(5).trim()
          if (!data || data === "[DONE]") continue
          onDelta(data)
        } else if (line.trim() !== "") {
          onDelta(line)
        }
      }

      sepIndex = buffer.indexOf("\n\n")
    }
  }
}
