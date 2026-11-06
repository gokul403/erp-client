import { createFileRoute } from "@tanstack/react-router";
import { TTPage } from "@/pages/Timetable";

export const Route = createFileRoute("/timetable")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      classId: (search.classId as string) || undefined,
    };
  },
  head: () => ({ meta: [{ title: "Timetable — EduSync" }] }),
  component: TTPage,
});
