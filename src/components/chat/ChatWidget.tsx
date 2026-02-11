import { useState, useEffect } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import type { ChatWidgetProps } from './types';
import { ChatWidgetContent } from './ChatWidgetContent';

export default function ChatWidget({ currentUser, convexUrl }: ChatWidgetProps) {
    const [convexClient, setConvexClient] = useState<ConvexReactClient | null>(null);

    useEffect(() => {
        if (!convexUrl) return;

        const client = new ConvexReactClient(convexUrl);
        setConvexClient(client);

        return () => {
            client.close();
        };
    }, [convexUrl]);

    if (!convexClient) return null;

    return (
        <ConvexProvider client={convexClient}>
            <ChatWidgetContent currentUser={currentUser} />
        </ConvexProvider>
    );
}
