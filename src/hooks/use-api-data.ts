import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

// --- SCHOOLS ---
export function useSchoolsQuery() {
  return useQuery({
    queryKey: ["schools"],
    queryFn: () => apiClient.get<any[]>("/schools"),
  });
}

// --- STUDENTS ---
export function useStudentsQuery() {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => apiClient.get<any[]>("/students"),
  });
}

export function useStudentsByClassQuery(params: { grade: string; section?: string } | null) {
  return useQuery({
    queryKey: ["students-by-class", params?.grade, params?.section],
    queryFn: () => {
      if (!params?.grade) return Promise.resolve([]);
      const qs = params.section
        ? `/students?grade=${encodeURIComponent(params.grade)}&section=${encodeURIComponent(params.section)}`
        : `/students?grade=${encodeURIComponent(params.grade)}`;
      return apiClient.get<any[]>(qs);
    },
    enabled: !!params?.grade,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/students", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useAddBulkStudentsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => apiClient.post("/students/bulk", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

// --- STAFF ---
export function useStaffQuery() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: () => apiClient.get<any[]>("/staff"),
  });
}

export function useAddStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/staff", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/staff/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

// --- ADMISSIONS ---
export function useAdmissionsQuery() {
  return useQuery({
    queryKey: ["admissions"],
    queryFn: () => apiClient.get<any[]>("/admissions"),
  });
}

export function useAddAdmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/admissions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}

export function useUpdateAdmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/admissions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}


// --- FEES ---
export function useFeesQuery() {
  return useQuery({
    queryKey: ["fees"],
    queryFn: () => apiClient.get<any[]>("/fees"),
  });
}

export function useAddFeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/fees", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

// --- TIMETABLE ---
export function useTimetableQuery() {
  return useQuery({
    queryKey: ["timetable"],
    queryFn: () => apiClient.get<any[]>("/timetable"),
  });
}

// --- BOOKS ---
export function useBooksQuery() {
  return useQuery({
    queryKey: ["books"],
    queryFn: () => apiClient.get<any[]>("/books"),
  });
}

export function useAddBookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/books", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

// --- ISSUED BOOKS ---
export function useIssuedBooksQuery() {
  return useQuery({
    queryKey: ["issued-books"],
    queryFn: () => apiClient.get<any[]>("/issued-books"),
  });
}

export function useIssueBookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/issued-books", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issued-books"] });
    },
  });
}

// --- ASSIGNMENTS ---
export function useAssignmentsQuery() {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: () => apiClient.get<any[]>("/assignments"),
  });
}

export function useAddAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/assignments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

// --- NOTIFICATIONS ---
export function useNotificationsQuery() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.get<any[]>("/notifications"),
  });
}

export function useAddNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/notifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// --- SUBSCRIPTIONS ---
export function useSubscriptionsQuery() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => apiClient.get<any[]>("/subscriptions"),
  });
}

// --- USERS ---
export function useUsersQuery() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.get<any[]>("/users"),
  });
}

// --- DEPARTMENTS ---
export function useDepartmentsQuery() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => apiClient.get<any[]>("/departments"),
  });
}

export function useAddDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/departments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/departments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

// --- CLASSES ---
export function useClassesQuery() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: () => apiClient.get<any[]>("/classes"),
  });
}

export function useAddClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/classes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useUpdateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/classes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useDeleteClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

// --- CLASS TIMETABLES ---
export function useClassTimetableQuery(classId: string, academicYear: string, term: string) {
  return useQuery({
    queryKey: ["class-timetable", classId, academicYear, term],
    queryFn: () =>
      apiClient.get<any>(
        `/class-timetables?classId=${encodeURIComponent(classId)}&academicYear=${encodeURIComponent(academicYear)}&term=${encodeURIComponent(term)}`
      ),
    enabled: !!classId && !!academicYear && !!term,
    retry: false,
  });
}

export function useClassTimetablesQuery() {
  return useQuery({
    queryKey: ["class-timetables"],
    queryFn: () => apiClient.get<any[]>("/class-timetables"),
  });
}

export function useTeacherTimetablesQuery() {
  return useQuery({
    queryKey: ["teacher-timetables"],
    queryFn: () => apiClient.get<any[]>("/class-timetables/teacher"),
  });
}

export function useTeacherTodayScheduleQuery(date?: string) {
  return useQuery({
    queryKey: ["teacher-today-schedule", date],
    queryFn: () => {
      const url = date ? `/class-timetables/teacher/today?date=${encodeURIComponent(date)}` : "/class-timetables/teacher/today";
      return apiClient.get<any[]>(url);
    },
  });
}

export function useUpsertClassTimetableMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/class-timetables", data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["class-timetable", data.class_id, data.academic_year, data.term]
      });
    },
  });
}

// --- ORGANIZATION ---
export function useOrganizationsQuery() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => apiClient.get<any[]>("/organization"),
  });
}

export function useAddOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/organization", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/organization/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useDeleteOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/organization/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

// --- FEE MANAGEMENT ---
export function useFeeAllocationsQuery() {
  return useQuery({
    queryKey: ["fee-allocations"],
    queryFn: () => apiClient.get<any[]>("/feemanagement"),
  });
}

export function useSaveFeeAllocationsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { classLabel: string; allocations: any[] }) => apiClient.post("/feemanagement", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-allocations"] });
    },
  });
}

// --- ATTENDANCE ---
export function useAttendanceQuery(params: { className: string; date: string; period?: string }) {
  return useQuery({
    queryKey: ["attendance", params.className, params.date, params.period || "Period 4"],
    queryFn: () =>
      apiClient.get<any[]>(
        `/attendance?class_name=${encodeURIComponent(params.className)}&date=${encodeURIComponent(
          params.date
        )}&period=${encodeURIComponent(params.period || "Period 4")}`
      ),
    enabled: !!params.className && !!params.date,
  });
}
// --- EVENTS & ANNOUNCEMENTS MODULE ---

export function useEventsQuery(filters?: any) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            queryParams.append(key, String(val));
          }
        });
      }
      const queryString = queryParams.toString();
      const url = queryString ? `/events?${queryString}` : "/events";
      return apiClient.get<any[]>(url);
    },
  });
}

export function useEventDetailsQuery(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => apiClient.get<any>(`/events/${id}`),
    enabled: !!id,
  });
}

export function useTeacherDashboardEventsQuery() {
  return useQuery({
    queryKey: ["teacher-dashboard-events"],
    queryFn: () => apiClient.get<any[]>("/events/teacher-dashboard"),
  });
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-events"] });
    },
  });
}

export function useUpdateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/events/${id}`, data),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-events"] });
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-events"] });
    },
  });
}

export function usePublishEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/events/${id}/publish`, {}),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-events"] });
    },
  });
}

export function useArchiveEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/events/${id}/archive`, {}),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-events"] });
    },
  });
}

export function useCheckAttendanceQuery(params: { className: string; date: string; period: string }) {
  return useQuery({
    queryKey: ["attendance-check", params.className, params.date, params.period],
    queryFn: () =>
      apiClient.get<{ exists: boolean; count: number; records: any[] }>(
        `/attendance/check?class_name=${encodeURIComponent(params.className)}&date=${encodeURIComponent(
          params.date
        )}&period=${encodeURIComponent(params.period)}`
      ),
    enabled: !!params.className && !!params.date && !!params.period,
    staleTime: 0,
  });
}

export function useAssignedClassesQuery() {
  return useQuery({
    queryKey: ["assigned-classes"],
    queryFn: () => apiClient.get<any[]>("/attendance/assigned-classes"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttendanceSummaryQuery() {
  return useQuery({
    queryKey: ["attendance-summary"],
    queryFn: () => apiClient.get<any>("/attendance/summary"),
  });
}

export function useSaveAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { class_name: string; date: string; period?: string; records: any[] }) =>
      apiClient.post("/attendance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-check"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
    },
  });
}

export function useUpdateAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { class_name: string; date: string; period?: string; records: any[] }) =>
      apiClient.put("/attendance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-check"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
    },
  });
}
