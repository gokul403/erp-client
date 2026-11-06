import { createFileRoute } from "@tanstack/react-router";
import { MembersPage } from "@/pages/Members";

export const Route = createFileRoute("/members")({
  head: () => ({ meta: [{ title: "Library Members — EduSync" }] }),
  component: MembersPage,
});
