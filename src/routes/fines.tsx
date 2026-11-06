import { createFileRoute } from "@tanstack/react-router";
import { FinesPage } from "@/pages/Fines";

export const Route = createFileRoute("/fines")({
  head: () => ({ meta: [{ title: "Fines — EduSync" }] }),
  component: FinesPage,
});
