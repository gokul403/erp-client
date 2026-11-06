import { createFileRoute } from "@tanstack/react-router";
import { EventManagementPage } from "@/pages/EventManagement";

export const Route = createFileRoute("/events")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      eventId: (search.eventId as string) || undefined,
    };
  },
  head: () => ({ meta: [{ title: "Event Centre — EduSync" }] }),
  component: EventManagementPage,
});
