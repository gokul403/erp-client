
import { createFileRoute } from "@tanstack/react-router";
import { StudentsPage } from "@/pages/Students";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "Students — EduSync" }] }),
  component: StudentsPage,
});