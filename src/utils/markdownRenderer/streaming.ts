import { MdToHtml } from 'streaming-md-to-html'
import { processMarkdown } from './processor'

type RenderCallback = (html: string) => void

export class StreamingMarkdownRenderer {
  private mdToHtml: MdToHtml
  private accumulatedRaw: string
  private debounceTimer: ReturnType<typeof setTimeout> | null
  private debounceMs: number
  private callback: RenderCallback | null
  private finalResolved: boolean

  constructor(debounceMs = 80) {
    this.mdToHtml = new MdToHtml()
    this.accumulatedRaw = ''
    this.debounceTimer = null
    this.debounceMs = debounceMs
    this.callback = null
    this.finalResolved = false
  }

  onRender(cb: RenderCallback) {
    this.callback = cb
  }

  append(chunk: string) {
    this.accumulatedRaw += chunk
    this.scheduleDebouncedRender()
  }

  private scheduleDebouncedRender() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null
      this.renderStreaming()
    }, this.debounceMs)
  }

  private renderStreaming() {
    if (!this.callback) return

    const result = this.mdToHtml.append(this.accumulatedRaw)
    let html: string
    if (result.lastLineUpdated || result.newLines) {
      html = MdToHtml.getHtml(this.mdToHtml.lines)
    } else {
      html = MdToHtml.getHtml(this.mdToHtml.lines)
    }
    this.callback(html)
  }

  async finalize(): Promise<string> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    if (this.finalResolved) {
      return processMarkdown(this.accumulatedRaw)
    }
    this.finalResolved = true
    const fullHtml = await processMarkdown(this.accumulatedRaw)
    return fullHtml
  }

  getRaw(): string {
    return this.accumulatedRaw
  }

  reset() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    this.mdToHtml = new MdToHtml()
    this.accumulatedRaw = ''
    this.finalResolved = false
  }
}
