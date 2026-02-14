/**
 * Shared Convex server client for SSR pages.
 * Use this instead of fetch() self-calls to avoid SSR deadlocks.
 */
import { ConvexHttpClient } from "convex/browser";

let _client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
    if (!_client) {
        _client = new ConvexHttpClient(
            import.meta.env.PUBLIC_CONVEX_URL
        );
    }
    return _client;
}
