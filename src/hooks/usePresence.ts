
import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * usePresence Hook
 * Sends a heartbeat every 30 seconds to keep the user "Online".
 */
export function usePresence(user: { id: string; name: string }, path?: string) {
    const heartbeat = useMutation(api.chat.heartbeat);

    useEffect(() => {
        if (!user) return;

        const sendHeartbeat = async () => {
            try {
                await heartbeat({
                    user: user.id,
                    name: user.name,
                    path
                });
                console.log("[Presence] Heartbeat sent for", user.name);
            } catch (error) {
                console.error("[Presence] Heartbeat failed:", error);
            }
        };

        // Initial heartbeat
        sendHeartbeat();

        // Interval heartbeat (30s)
        const interval = setInterval(sendHeartbeat, 30000);

        return () => clearInterval(interval);
    }, [user, path, heartbeat]);
}
