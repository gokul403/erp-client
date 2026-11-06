import { createFileRoute } from "@tanstack/react-router";
import { FeeStructurePage } from "@/pages/FeeStructure";

export const Route = createFileRoute("/fee-structure")({
  head: () => ({ meta: [{ title: "Fee Structure — EduSync" }] }),
  component: FeeStructurePage,
});
