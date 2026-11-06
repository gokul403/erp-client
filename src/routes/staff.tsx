import { createFileRoute } from "@tanstack/react-router";
import { StaffPage } from "@/pages/Staff";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Staff — EduSync" }] }),
  component: StaffPage,
});
