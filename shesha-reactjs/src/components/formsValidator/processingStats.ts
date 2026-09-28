import { ItemStatus } from "./models";

export interface StatsSnapshot {
  total: number;
  done: number;
  failed: number;
  processed: number;
  remaining: number;
  percent: number;
  // timing
  elapsedMs: number; // live, ticks while running
  avgPerItemMs: number | null; // null until ≥1 item completes
  remainingMs: number | null; // estimate from now until finish
  estimatedTotalMs: number | null; // estimate for the whole run
}

export class ProcessingStats {
  private counts: Record<ItemStatus, number> = {
    pending: 0,
    processing: 0,
    done: 0,
    error: 0,
  };

  private _total = 0;

  /** Elapsed time carried over from previous runs (stop/start, retry, etc.). */
  private accumulatedMs = 0;

  /** Timestamp when the current active run started, or null if paused. */
  private runStartedAt: number | null = null;

  /**
   * Used as the numerator for the average, so the ETA stays stable
   * Elapsed time captured the moment the most recent item completed.
   * while an item is being processed.
   */
  private lastCompletionElapsedMs = 0;

  /** Fresh queue: reset counters and all timing. */
  setTotal(total: number): void {
    this._total = total;
    this.counts = { pending: total, processing: 0, done: 0, error: 0 };
    this.accumulatedMs = 0;
    this.runStartedAt = null;
    this.lastCompletionElapsedMs = 0;
  }

  /* --------------------------- Timing control -------------------------- */

  startRun(): void {
    if (this.runStartedAt !== null) return; // already running
    this.runStartedAt = Date.now();
  }

  stopRun(): void {
    if (this.runStartedAt === null) return;
    this.accumulatedMs += Date.now() - this.runStartedAt;
    this.runStartedAt = null;
  }

  /** Call once the processing loop has finished. */
  finishRun(): void {
    this.stopRun();
  }

  private elapsedMs(): number {
    return (
      this.accumulatedMs +
      (this.runStartedAt !== null ? Date.now() - this.runStartedAt : 0)
    );
  }

  /* ------------------------- Status transitions ------------------------ */

  transition(from: ItemStatus, to: ItemStatus): void {
    if (from === to) return;
    if (this.counts[from] > 0) this.counts[from] -= 1;
    this.counts[to] += 1;

    // Freeze the average at the moment an item reaches a terminal state.
    if ((to === 'done' || to === 'error') && from !== 'done' && from !== 'error') {
      this.lastCompletionElapsedMs = this.elapsedMs();
    }
  }

  incDone(from: ItemStatus): void {
    this.transition(from, 'done');
  }

  incFailed(from: ItemStatus): void {
    this.transition(from, 'error');
  }

  resetToPending(): void {
    this.counts = { pending: this._total, processing: 0, done: 0, error: 0 };
    this.accumulatedMs = 0;
    this.runStartedAt = null;
    this.lastCompletionElapsedMs = 0;
  }

  requeueProcessing(): void {
    this.counts.pending += this.counts.processing;
    this.counts.processing = 0;
  }

  /* ------------------------------ Snapshot ----------------------------- */

  snapshot(): StatsSnapshot {
    const { pending, processing, done, error } = this.counts;
    const processed = done + error;
    const remaining = pending + processing;
    const elapsed = this.elapsedMs();

    const avgPerItemMs =
      processed > 0 ? this.lastCompletionElapsedMs / processed : null;

    const remainingMs =
      avgPerItemMs !== null && remaining > 0 ? avgPerItemMs * remaining : null;

    const estimatedTotalMs =
      avgPerItemMs !== null ? avgPerItemMs * this._total : null;

    return {
      total: this._total,
      done,
      failed: error,
      processed,
      remaining,
      percent: this._total === 0 ? 0 : Math.round((processed / this._total) * 100),
      elapsedMs: elapsed,
      avgPerItemMs,
      remainingMs,
      estimatedTotalMs,
    };
  }
}

/** Human-friendly duration, e.g. `1m 12s`, `—` when unknown. */
export function formatDuration(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return '—';
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
