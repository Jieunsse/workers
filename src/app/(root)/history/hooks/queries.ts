import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * ✅ BFF 프록시 기반 (httpOnly cookie 인증)
 */
function proxyUrl(path: string) {
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `/api/proxy/${p}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(proxyUrl(path), { ...init, credentials: 'include' });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;

  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export type ApiFrequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type Group = {
  id: number;
  name: string;
  image?: string | null;
};

export type Membership = { group: Group };

export type MeResponse = {
  id: number;
  nickname: string;
  image: string | null;
  memberships: Membership[];
};

export type TaskList = {
  id: number;
  name: string;
  displayIndex: number;
};

export type GroupDetailResponse = {
  id: number;
  name: string;
  taskLists: TaskList[];
};

export type DoneTask = {
  id: number;
  name: string;
  description?: string | null;

  // doneAt(완료시각) / date(할일 날짜) 둘중 하나는 있다고 가정
  doneAt?: string | null;
  date?: string | null;

  commentCount?: number | null;
  frequency?: ApiFrequency | null;

  writer?: {
    id: number;
    nickname: string;
    image: string | null;
  } | null;

  // taskListId 필수로 붙여서 내려오는 케이스가 많음 (없으면 우리가 주입)
  taskListId?: number | null;
};

export type DoneTasksResponse = {
  tasksDone: DoneTask[];
};

export type CommentWriter = { id: number; nickname: string; image: string | null };

export type ApiComment = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId?: number;
  userId?: number;
  user?: CommentWriter;
};

// ===== Queries =====

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeResponse>('user/me'),
    staleTime: 60_000,
  });
}

/** ✅ 그룹 상세 (taskLists) */
export function useGroupDetail(groupId: number) {
  return useQuery({
    queryKey: ['groupDetail', groupId],
    queryFn: () => apiFetch<GroupDetailResponse>(`groups/${groupId}`),
    enabled: Number.isFinite(groupId) && groupId > 0,
    staleTime: 30_000,
  });
}

/**
 * ✅ "완료된 task" 조회 (taskList 단위)
 * - 월 선택이면 from/to로 범위를 주는게 제일 흔함.
 * - 스웨거랑 다르면 아래 URL 1줄만 바꿔.
 */
export function useDoneTasksByTaskList(params: {
  groupId: number;
  taskListId: number;
  fromIso: string;
  toIso: string;
}) {
  const { groupId, taskListId, fromIso, toIso } = params;

  return useQuery({
    queryKey: ['doneTasks', groupId, taskListId, fromIso, toIso],
    queryFn: async () => {
      // ✅ TODO: 스웨거 경로 확인해서 여기만 맞추면 끝
      // 흔한 형태 예시:
      // 1) groups/{groupId}/task-lists/{taskListId}/tasks/done?from=...&to=...
      // 2) groups/{groupId}/task-lists/{taskListId}/tasks?done=true&from=...&to=...
      const path = `groups/${groupId}/task-lists/${taskListId}/tasks/done?from=${encodeURIComponent(
        fromIso,
      )}&to=${encodeURIComponent(toIso)}`;

      const data = await apiFetch<DoneTasksResponse>(path);

      // taskListId가 서버 응답에 없으면 주입해서 history에서 필터링 가능하게
      const tasks = (data?.tasksDone ?? []).map((t) => ({
        ...t,
        taskListId: (t.taskListId ?? taskListId) as number,
      }));

      return { tasksDone: tasks };
    },
    enabled:
      Number.isFinite(groupId) &&
      groupId > 0 &&
      Number.isFinite(taskListId) &&
      taskListId > 0 &&
      !!fromIso &&
      !!toIso,
    staleTime: 10_000,
  });
}

/**
 * ✅ 여러 taskList의 done tasks를 한 번에 모으는 Hook
 * - rules-of-hooks 위반 없이, useQueries는 컴포넌트 최상단에서만 1번 호출.
 */
export function useDoneTasksForTaskLists(params: {
  groupId: number;
  taskListIds: number[];
  fromIso: string;
  toIso: string;
}) {
  const { groupId, taskListIds, fromIso, toIso } = params;

  const queries = useQueries({
    queries: taskListIds.map((taskListId) => ({
      queryKey: ['doneTasks', groupId, taskListId, fromIso, toIso],
      queryFn: async () => {
        const path = `groups/${groupId}/task-lists/${taskListId}/tasks/done?from=${encodeURIComponent(
          fromIso,
        )}&to=${encodeURIComponent(toIso)}`;

        const data = await apiFetch<DoneTasksResponse>(path);
        const tasks = (data?.tasksDone ?? []).map((t) => ({
          ...t,
          taskListId: (t.taskListId ?? taskListId) as number,
        }));
        return { taskListId, tasksDone: tasks };
      },
      enabled:
        Number.isFinite(groupId) &&
        groupId > 0 &&
        Number.isFinite(taskListId) &&
        taskListId > 0 &&
        !!fromIso &&
        !!toIso,
      staleTime: 10_000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const tasksDoneAll = queries.flatMap((q) => (q.data?.tasksDone ?? []) as DoneTask[]);

  return { tasksDoneAll, isLoading, isError };
}

// ===== Comments =====

export function useTaskComments(taskId: number) {
  return useQuery({
    queryKey: ['taskComments', taskId],
    queryFn: () => apiFetch<ApiComment[]>(`tasks/${taskId}/comments`),
    enabled: Number.isFinite(taskId) && taskId > 0,
  });
}

export function useCreateTaskComment(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { content: string }) =>
      apiFetch<ApiComment>(`tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['taskComments', taskId] });
    },
  });
}

// ===== Direct mutations for history (hook in map 금지 회피) =====

export async function patchTaskDone(params: {
  groupId: number;
  taskListId: number;
  taskId: number;
  done: boolean;
}) {
  const { groupId, taskListId, taskId, done } = params;

  return apiFetch<void>(`groups/${groupId}/task-lists/${taskListId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done }),
  });
}

export async function deleteTask(params: { groupId: number; taskListId: number; taskId: number }) {
  const { groupId, taskListId, taskId } = params;

  return apiFetch<void>(`groups/${groupId}/task-lists/${taskListId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}
