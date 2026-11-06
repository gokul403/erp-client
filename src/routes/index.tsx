import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/pages/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — EduSync School ERP" },
      { name: "description", content: "Unified dashboard for school operations, admissions, fees, attendance and academics." },
    ],
  }),
  component: Dashboard,
});
