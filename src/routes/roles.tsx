import { createFileRoute } from "@tanstack/react-router";
import { RolesPage } from "@/pages/Roles";

export const Route = createFileRoute("/roles")({
  head: () => ({ meta: [{ title: "User Roles — EduSync" }] }),
  component: RolesPage,
});
