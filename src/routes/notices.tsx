import { createFileRoute } from "@tanstack/react-router";
import { NoticesPage } from "@/pages/Notices";

export const Route = createFileRoute("/notices")({
  head: () => ({ meta: [{ title: "Notices — EduSync" }] }),
  component: NoticesPage,
});
