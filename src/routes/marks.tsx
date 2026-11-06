import { createFileRoute } from "@tanstack/react-router";
import { MarksPage } from "@/pages/Marks";

export const Route = createFileRoute("/marks")({
  head: () => ({ meta: [{ title: "Marks Entry — EduSync" }] }),
  component: MarksPage,
});
