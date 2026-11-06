import { createFileRoute } from "@tanstack/react-router";
import { AssignmentsPage } from "@/pages/Assignments";

export const Route = createFileRoute("/assignments")({
  head: () => ({ meta: [{ title: "Assignments — EduSync" }] }),
  component: AssignmentsPage,
});
