export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '🔥', '👏'];

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
