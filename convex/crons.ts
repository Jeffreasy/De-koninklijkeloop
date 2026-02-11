import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up analytics_events older than 90 days — runs daily at 03:00 UTC
crons.daily(
    "cleanup old analytics events",
    { hourUTC: 3, minuteUTC: 0 },
    internal.analyticsCleanup.deleteOldEvents,
);

export default crons;
