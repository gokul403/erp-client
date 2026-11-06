import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/pages/Reports";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — EduSync" }] }),
  component: ReportsPage,
});
