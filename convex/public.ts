import { query } from "./_generated/server";

// Simple health check query
export const ping = query({
    args: {},
    handler: async () => {
        return "pong";
    },
});
