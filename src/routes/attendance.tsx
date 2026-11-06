import { createFileRoute } from "@tanstack/react-router";
import { AttPage } from "@/pages/Attendance";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance — EduSync" }] }),
  component: AttPage,
});
