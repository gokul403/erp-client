import { createFileRoute } from "@tanstack/react-router";
import { OrganizationPage } from "@/pages/Organization";

export const Route = createFileRoute("/organization")({
  head: () => ({ meta: [{ title: "Organization Profile — EduSync" }] }),
  component: OrganizationPage,
});
