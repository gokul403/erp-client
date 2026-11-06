import { createFileRoute } from "@tanstack/react-router";
import { ClassesPage } from "@/pages/Classes";

export const Route = createFileRoute("/classes")({
  head: () => ({ meta: [{ title: "Classes — EduSync" }] }),
  component: ClassesPage,
});
