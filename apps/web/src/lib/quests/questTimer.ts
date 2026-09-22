/**
 * Formats seconds into human-readable duration (e.g. "45s", "5m 20s", "1h 12m").
 */
export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }

  return `${secs}s`;
}

/**
 * Formats seconds into digital timer format "HH:MM:SS" or "MM:SS".
 */
export function formatDigitalTimer(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Computes the total elapsed seconds for a quest, factoring in live time if running.
 */
export function computeLiveQuestSeconds(quest: {
  timerSeconds: number;
  timerRunning: boolean;
  timerStartedAt: string | null;
}): number {
  if (!quest.timerRunning || !quest.timerStartedAt) {
    return quest.timerSeconds;
  }

  const startedAt = new Date(quest.timerStartedAt).getTime();
  const live = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));

  return quest.timerSeconds + live;
}
