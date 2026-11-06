import { createFileRoute } from "@tanstack/react-router";
import { AdmissionsPage } from "@/pages/Admissions";

export const Route = createFileRoute("/admissions")({
  head: () => ({ meta: [{ title: "Admissions — EduSync" }] }),
  component: AdmissionsPage,
});
