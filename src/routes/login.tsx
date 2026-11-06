import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — EduSync ERP" },
      { name: "description", content: "Sign in to the EduSync School Management ERP demo." },
    ],
  }),
  component: LoginPage,
});
