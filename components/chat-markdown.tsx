"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type ChatMarkdownProps = {
  content: string
}

function normalizeChatMarkdown(content: string): string {
  let text = content.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n")

  text = text.replace(/(---)(?=#{1,6}\S)/g, "$1\n\n")
  text = text.replace(/^(\s{0,3}#{1,6})(\S)/gm, "$1 $2")
  text = text.replace(/^(\s{0,3}[-+*])([^\s\-+*])/gm, "$1 $2")
  text = text.replace(/^(\s{0,3}\d+\.)\s*(\S)/gm, "$1 $2")
  text = text.replace(/^>\s*(\S)/gm, "> $1")
  text = text.replace(/([\uFF1A:\u3002\uFF1F\uFF01\uFF09])(?=(?:[-+*]\s|\d+\.\s|#{1,6}\s))/g, "$1\n")
  text = text.replace(/([^\n])(?=#{1,6}\s)/g, "$1\n\n")

  return text.replace(/\n{3,}/g, "\n\n").trim()
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="space-y-3 text-[14.5px] leading-7 text-foreground/90">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap leading-7">{children}</p>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="my-3 list-disc space-y-2 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-2 pl-5">{children}</ol>,
          li: ({ children }) => <li className="pl-1 leading-7 marker:text-primary/60">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 rounded-r-xl border-l-4 border-primary/30 bg-muted/35 px-4 py-3 text-foreground/80">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isInline = !className
            if (isInline) {
              return <code className="rounded bg-muted px-1.5 py-0.5 text-[0.92em]">{children}</code>
            }
            return <code className={className}>{children}</code>
          },
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-xl bg-muted px-4 py-3 text-[0.9em] leading-6">
              {children}
            </pre>
          ),
          h1: ({ children }) => <h1 className="mt-6 text-xl font-semibold tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-6 text-lg font-semibold tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-5 text-base font-semibold tracking-tight">{children}</h3>,
          h4: ({ children }) => <h4 className="mt-4 text-[15px] font-semibold">{children}</h4>,
          hr: () => <hr className="my-5 border-border/60" />,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border/60 bg-muted px-3 py-2 text-left font-medium">{children}</th>
          ),
          td: ({ children }) => <td className="border border-border/60 px-3 py-2 align-top">{children}</td>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        }}
      >
        {normalizeChatMarkdown(content)}
      </ReactMarkdown>
    </div>
  )
}
