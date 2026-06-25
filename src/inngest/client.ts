// src/inngest/client.ts
import { eventType, Inngest, staticSchema } from "inngest";

export const inngest = new Inngest({ id: "content-ph" });

export const metaConnectionCreated = eventType("meta/connection.created", {
  schema: staticSchema<{ connectionId: string; userId: string }>(),
});
 
export const metaConnectionSyncRequested = eventType("meta/connection.sync-requested", {
  schema: staticSchema<{ connectionId: string }>(),
});
 