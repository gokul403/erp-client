import { createFileRoute } from "@tanstack/react-router";
import { SchoolsPage } from "@/pages/Schools";

export const Route = createFileRoute("/schools")({
  head: () => ({ meta: [{ title: "Schools — EduSync" }] }),
  component: SchoolsPage,
});
