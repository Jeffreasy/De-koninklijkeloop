
import { useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../lib/api';

/**
 * usePresence Hook
 * Sends a heartbeat every 30s to keep the user "Online" in the Go Redis presence system.
 * Pass null for user to disable (e.g. on public pages).
 *
 * The Go backend extracts UserID and Role from the JWT — we just need to POST.
 * TTL in Redis is 60s, so 30s interval gives 30s of buffer for cold starts / network hiccups.
 */
export function usePresence(
    user: { id: string; name: string; role?: string } | null,
    path?: string
) {
    // Stable ref so the effect doesn't re-run on every render (object identity changes)
    const userRef = useRef(user);
    userRef.current = user;

    useEffect(() => {
        if (!userRef.current) return;

        const sendHeartbeat = async () => {
            try {
                await apiRequest('/v1/presence/heartbeat', { method: 'POST' });
            } catch (error) {
                console.warn('[Presence] Heartbeat failed:', error);
            }
        };

        // Send immediately on mount
        sendHeartbeat();

        // Every 30s — stays within 60s Redis TTL
        const interval = setInterval(sendHeartbeat, 30_000);
        return () => clearInterval(interval);

        // Note: we intentionally only depend on whether the user is null or not,
        // not on the object itself (would cause re-runs on every render)
    }, [user === null]); // re-run only when user goes null/non-null
}

/**
 * useTypingIndicator Hook
 * Disabled pending full SSE typing integration in Go backend.
 */
export function useTypingIndicator(_currentUser: string) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startTyping = useCallback((_typingTo: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => { }, 3000);
    }, []);

    const stopTyping = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return { startTyping, stopTyping };
}
