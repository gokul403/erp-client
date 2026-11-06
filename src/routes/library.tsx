import { createFileRoute } from "@tanstack/react-router";
import { LibPage } from "@/pages/Library";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Library — EduSync" }] }),
  component: LibPage,
});
