import { createFileRoute } from "@tanstack/react-router";
import { NotifPage } from "@/pages/Notifications";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — EduSync" }] }),
  component: NotifPage,
});
