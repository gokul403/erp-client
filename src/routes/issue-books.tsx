import { createFileRoute } from "@tanstack/react-router";
import { IssuePage } from "@/pages/IssueBooks";

export const Route = createFileRoute("/issue-books")({
  head: () => ({ meta: [{ title: "Issue & Return — EduSync" }] }),
  component: IssuePage,
});
