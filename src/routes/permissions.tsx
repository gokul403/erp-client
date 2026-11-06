import { createFileRoute } from "@tanstack/react-router";
import { PermissionsPage } from "@/pages/Permissions";

export const Route = createFileRoute("/permissions")({
  head: () => ({ meta: [{ title: "Permissions — EduSync" }] }),
  component: PermissionsPage,
});
