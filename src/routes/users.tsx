import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/pages/Users";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "Users & Roles — EduSync" }] }),
  component: UsersPage,
});
