import { createFileRoute } from "@tanstack/react-router";
import { DepartmentsPage } from "@/pages/Departments";

export const Route = createFileRoute("/departments")({
  head: () => ({ meta: [{ title: "Departments — EduSync" }] }),
  component: DepartmentsPage,
});
