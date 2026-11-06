import { createFileRoute } from "@tanstack/react-router";
import { FeesPage } from "@/pages/Fees";

export const Route = createFileRoute("/fees")({
  head: () => ({ meta: [{ title: "Fees — EduSync" }] }),
  component: FeesPage,
});
