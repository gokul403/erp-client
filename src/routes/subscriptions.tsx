import { createFileRoute } from "@tanstack/react-router";
import { SubsPage } from "@/pages/Subscriptions";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions — EduSync" }] }),
  component: SubsPage,
});
