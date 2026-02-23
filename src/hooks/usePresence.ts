
import { useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../lib/api';

/**
 * usePresence Hook
 * Sends a heartbeat every 30s to keep the user "Online".
 * Pass null for user to disable the heartbeat entirely.
 */
export function usePresence(
    user: { id: string; name: string; role?: string } | null,
    path?: string // Note: Backend doesn't currently store path in Redis, but we keep it for signature
) {
    useEffect(() => {
        if (!user) return;

        const sendHeartbeat = async () => {
            try {
                // The Go backend extracts UserID and Role directly from the Context/JWT
                await apiRequest('/v1/presence/heartbeat', {
                    method: 'POST'
                });
            } catch (error) {
                console.warn("[Presence] Heartbeat failed:", error);
            }
        };

        sendHeartbeat();
        // Go backend expects a ping every 30s to stay within the 60s TTL window
        const interval = setInterval(sendHeartbeat, 30000);
        return () => clearInterval(interval);
    }, [user, path]);
}

/**
 * useTypingIndicator Hook
 * Note: Temporarily disabled (no-op) until full SSE presence triggers are built in Go.
 */
export function useTypingIndicator(currentUser: string) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startTyping = useCallback((typingTo: string) => {
        // Disabled for now, as typing status hasn't been migrated to Redis/SSE yet
        // apiRequest('/v1/messages/typing', { method: 'POST', body: { typingTo } }).catch(() => {});
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            // apiRequest('/v1/messages/typing', { method: 'DELETE' }).catch(() => {});
        }, 3000);
    }, [currentUser]);

    const stopTyping = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // apiRequest('/v1/messages/typing', { method: 'DELETE' }).catch(() => {});
    }, [currentUser]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return { startTyping, stopTyping };
}
