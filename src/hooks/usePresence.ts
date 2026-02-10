
import { useEffect, useCallback, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * usePresence Hook
 * Sends a heartbeat every 30 seconds to keep the user "Online".
 * Now includes role for badge display.
 */
export function usePresence(
    user: { id: string; name: string; role?: string },
    path?: string
) {
    const heartbeat = useMutation(api.chat.heartbeat);

    useEffect(() => {
        if (!user) return;

        const sendHeartbeat = async () => {
            try {
                await heartbeat({
                    user: user.id,
                    name: user.name,
                    path,
                    role: (user.role === "admin" || user.role === "editor") ? user.role : undefined,
                });
            } catch (error) {
                console.error("[Presence] Heartbeat failed:", error);
            }
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 30000);
        return () => clearInterval(interval);
    }, [user, path, heartbeat]);
}

/**
 * useTypingIndicator Hook
 * Debounced typing status. Sends "typing" on keypress, clears after 3s idle.
 */
export function useTypingIndicator(currentUser: string) {
    const setTyping = useMutation(api.chat.setTyping);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startTyping = useCallback((typingTo: string) => {
        setTyping({ user: currentUser, typingTo }).catch(() => { });

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setTyping({ user: currentUser, typingTo: undefined }).catch(() => { });
        }, 3000);
    }, [currentUser, setTyping]);

    const stopTyping = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTyping({ user: currentUser, typingTo: undefined }).catch(() => { });
    }, [currentUser, setTyping]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return { startTyping, stopTyping };
}
