import { createFileRoute } from "@tanstack/react-router";
import { AcademicYearPage } from "@/pages/AcademicYear";

export const Route = createFileRoute("/academic-year")({
  head: () => ({ meta: [{ title: "Academic Years — EduSync" }] }),
  component: AcademicYearPage,
});
