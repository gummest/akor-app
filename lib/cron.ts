// This file defines cron job configurations for OpenClaw
// Daily sync: runs every 6 hours
// Weekly sync: runs every Sunday at 03:00

export const CRON_CONFIG = {
  dailySync: {
    schedule: "0 */6 * * *", // Every 6 hours
    endpoint: "/api/sync/trigger",
    method: "POST",
    body: { type: "daily" },
  },
  weeklySync: {
    schedule: "0 3 * * 0", // Sunday 03:00
    endpoint: "/api/sync/trigger",
    method: "POST",
    body: { type: "weekly" },
  },
} as const;
