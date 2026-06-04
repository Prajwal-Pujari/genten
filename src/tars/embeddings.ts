// ═══════════════════════════════════════════════════════════════
// Genten — TARS Embedding Queue Manager
// ═══════════════════════════════════════════════════════════════

/**
 * Manages a queue of notes that need embedding vectors generated.
 * Processes one at a time to avoid overwhelming the GPU.
 * Dormant when TARS is not configured.
 */
export class EmbeddingQueue {
  private queue: string[] = []
  private processing = false

  enqueue(noteId: string): void {
    if (!this.queue.includes(noteId)) {
      this.queue.push(noteId)
    }
  }

  get pending(): number {
    return this.queue.length
  }

  get isProcessing(): boolean {
    return this.processing
  }

  // Phase 5: implement actual embedding processing
  async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return
    this.processing = true
    // Process queue items...
    this.processing = false
  }
}

export const embeddingQueue = new EmbeddingQueue()
