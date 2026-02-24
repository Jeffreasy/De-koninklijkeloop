export const QUICK_REACTIONS = ['\uD83D\uDC4D', '\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDE2E', '\uD83D\uDD25', '\uD83D\uDC4F'];

/**
 * Parse a last_active ISO string from the Go backend.
 * Go zero-time (0001-01-01T00:00:00Z) returns a huge negative number —
 * that caused formatLastSeen to show '1 jan.' for every offline user.
 * Returns null if the timestamp is invalid or represents the zero-time.
 */
export function parseLastActive(isoString: string | null | undefined): number | null {
    if (!isoString) return null;
    // Go zero-time check
    if (isoString.startsWith('0001-')) return null;
    const ts = Date.parse(isoString);
    if (isNaN(ts) || ts <= 0) return null;
    return ts;
}

export function formatLastSeen(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "zojuist";
    if (minutes < 60) return `${minutes} min geleden`;
    if (hours < 24) {
        const date = new Date(timestamp);
        return `om ${date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (days === 1) return "gisteren";
    if (days < 7) return `${days} dagen geleden`;

    return new Date(timestamp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}
