'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** ===== helpers (proxy route) ===== */
function proxy(path: string) {
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `/api/proxy/${p}`;
}

async function assertOk(res: Response, message: string) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${message} (status: ${res.status}) ${text}`);
  }
}

/**
 * proxy 라우트가 수정되어 "null/빈문자열"도 반환 가능하므로
 * json 파싱은 "텍스트가 있을 때만" 수행해야 안전함.
 */
async function safeReadJson<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as unknown as T;

  const text = await res.text().catch(() => '');
  if (!text) return undefined as unknown as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`응답 JSON 파싱 실패: ${text.slice(0, 200)}`);
  }
}

function withTeam(teamId: string, path: string) {
  const t = String(teamId ?? '').trim();
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `${t}/${p}`;
}

async function fetchJson<T>(
  teamId: string,
  path: string,
  init?: RequestInit,
  message = '요청 실패',
): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const isBodyless = method === 'GET' || method === 'HEAD' || method === 'DELETE';

  const url =
    path === 'user'
      ? proxy(path) // ✅ user는 teamId 없이
      : proxy(withTeam(teamId, path));

  const res = await fetch(url, {
    ...init,
    method,
    body: isBodyless ? undefined : init?.body,
    credentials: 'include',
    headers: {
      ...(init?.headers ?? {}),
      ...(isBodyless ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
    },
  });

  await assertOk(res, message);
  return await safeReadJson<T>(res);
}

async function fetchVoid(
  teamId: string,
  path: string,
  init?: RequestInit,
  message = '요청 실패',
): Promise<void> {
  const method = (init?.method ?? 'GET').toUpperCase();

  const res = await fetch(proxy(withTeam(teamId, path)), {
    ...init,
    method,
    body: method === 'DELETE' || method === 'GET' || method === 'HEAD' ? undefined : init?.body,
    credentials: 'include',
  });

  await assertOk(res, message);
}

/** ===== types (swagger 기반 최소 필요 필드) ===== */
export type ApiFrequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type Group = {
  id: number;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Membership = {
  group: Group;
  role: 'ADMIN' | 'MEMBER';
  userImage: string;
  userEmail: string;
  userName: string;
  groupId: number;
  userId: number;
};

export type UserResponse = {
  teamId: string;
  image: string;
  nickname: string;
  updatedAt: string;
  createdAt: string;
  email: string;
  id: number;
  memberships: Membership[];
};

export type GroupMember = {
  id: number;
  email: string;
  nickname: string;
  image: string | null;
};

export type TaskList = {
  id: number;
  name: string;
  displayIndex: number;
  groupId: number;
  createdAt: string;
  updatedAt: string;
};

export type TaskWriter = { id: number; nickname: string; image: string | null } | null;

export type Task = {
  id: number;
  name: string;
  description?: string | null;

  date?: string;
  startDate?: string;
  startAt?: string;
  scheduledAt?: string;

  doneAt?: string | null;

  frequency?: ApiFrequency;
  frequencyType?: ApiFrequency;
  repeatType?: ApiFrequency;

  /** ✅ 서버는 number[] */
  weekDays?: number[];
  repeatWeekDays?: number[];
  repeatDays?: unknown;

  monthDay?: number;
  repeatMonthDay?: number;

  commentCount: number;
  writer?: TaskWriter;

  /** ✅ 반복 task면 존재 */
  recurringId?: number;
};

export type TaskListByDateResponse = {
  id: number;
  name: string;
  displayIndex: number;
  groupId: number;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
};

export type GroupDetailResponse = {
  id: number;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  taskLists: TaskList[];
  members: GroupMember[];
};

export type Comment = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: number;
  userId: number;
  user: { id: number; nickname: string; image: string | null };
};

/** ===== queries ===== */
export function useMe(teamId: string) {
  return useQuery({
    queryKey: ['me', teamId],
    enabled: !!teamId,
    queryFn: async () => {
      return fetchJson<UserResponse>(
        teamId,
        'user',
        undefined,
        '유저 정보를 불러오는데 실패했습니다.',
      );
    },
    staleTime: 30_000,
  });
}

export function useGroupDetail(teamId: string, groupId: number) {
  return useQuery({
    queryKey: ['groupDetail', teamId, groupId],
    enabled: !!teamId && groupId > 0,
    queryFn: async () => {
      return fetchJson<GroupDetailResponse>(
        teamId,
        `groups/${groupId}`,
        undefined,
        '그룹 정보를 불러오는데 실패했습니다.',
      );
    },
    staleTime: 10_000,
  });
}

export function useTaskListByDate(params: {
  teamId: string;
  groupId: number;
  taskListId: number;
  dateIso: string;
}) {
  const { teamId, groupId, taskListId, dateIso } = params;

  return useQuery({
    queryKey: ['taskListByDate', teamId, groupId, taskListId, dateIso],
    enabled: !!teamId && groupId > 0 && taskListId > 0 && !!dateIso,
    queryFn: async () => {
      return fetchJson<TaskListByDateResponse>(
        teamId,
        `groups/${groupId}/task-lists/${taskListId}?date=${encodeURIComponent(dateIso)}`,
        { cache: 'no-store' },
        '할 일 목록을 불러오는데 실패했습니다.',
      );
    },
  });
}

export function useTaskComments(teamId: string, taskId: number) {
  return useQuery({
    queryKey: ['taskComments', teamId, taskId],
    enabled: !!teamId && taskId > 0,
    queryFn: async () => {
      return fetchJson<Comment[]>(
        teamId,
        `tasks/${taskId}/comments`,
        undefined,
        '댓글을 불러오는데 실패했습니다.',
      );
    },
  });
}

/** ===== mutations ===== */
export function useCreateTaskList(teamId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { groupId: number; name: string }) => {
      return fetchJson<TaskList>(
        teamId,
        `groups/${vars.groupId}/task-lists`,
        { method: 'POST', body: JSON.stringify({ name: vars.name }) },
        '할 일 목록 생성에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['groupDetail', teamId, vars.groupId] });
    },
  });
}

export function useUpdateTaskList(teamId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { groupId: number; taskListId: number; name: string }) => {
      return fetchJson<TaskList>(
        teamId,
        `groups/${vars.groupId}/task-lists/${vars.taskListId}`,
        { method: 'PATCH', body: JSON.stringify({ name: vars.name }) },
        '할 일 목록 수정에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['groupDetail', teamId, vars.groupId] });
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', teamId, vars.groupId, vars.taskListId],
        exact: false,
      });
    },
  });
}

export function useDeleteTaskList(teamId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { groupId: number; taskListId: number }) => {
      return fetchVoid(
        teamId,
        `groups/${vars.groupId}/task-lists/${vars.taskListId}`,
        { method: 'DELETE' },
        '할 일 목록 삭제에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['groupDetail', teamId, vars.groupId] });
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', teamId, vars.groupId, vars.taskListId],
        exact: false,
      });
    },
  });
}

/**
 * ✅ (반복) 생성은 신규 API: /recurring
 * - WEEKLY: weekDays number[]
 * - MONTHLY: monthDay 필수
 */
export function useCreateTask(teamId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      groupId: number;
      taskListId: number;
      name: string;
      description?: string;
      startDate: string;
      frequencyType: ApiFrequency;
      weekDays?: number[];
      monthDay?: number;
    }) => {
      // ✅ 신규 recurring
      return fetchJson<unknown>(
        teamId,
        `groups/${vars.groupId}/task-lists/${vars.taskListId}/recurring`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: vars.name,
            description: vars.description ?? '',
            startDate: vars.startDate,
            frequencyType: vars.frequencyType,
            weekDays: vars.weekDays,
            monthDay: vars.monthDay,
          }),
        },
        '할 일 생성에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', teamId, vars.groupId, vars.taskListId],
        exact: false,
      });
    },
  });
}

/**
 * ✅ 수정:
 * - recurringId 있으면: /recurring/{recurringId}
 * - 없으면: /tasks/{taskId} (일반 task 수정/완료체크)
 */
export function usePatchTask(teamId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      groupId: number;
      taskListId: number;
      taskId: number;
      recurringId?: number;
      body: {
        name?: string;
        description?: string;
        startDate?: string;
        frequencyType?: ApiFrequency;
        weekDays?: number[];
        monthDay?: number;
        doneAt?: string | null;
      };
    }) => {
      const isDonePatchOnly = Object.keys(vars.body).length === 1 && 'doneAt' in vars.body;

      // ✅ doneAt은 무조건 tasks PATCH
      if (isDonePatchOnly) {
        return fetchJson<Task>(
          teamId,
          `groups/${vars.groupId}/task-lists/${vars.taskListId}/tasks/${vars.taskId}`,
          { method: 'PATCH', body: JSON.stringify(vars.body) },
          '할 일 수정에 실패했습니다.',
        );
      }

      // ✅ recurring 수정
      if (vars.recurringId) {
        return fetchJson<unknown>(
          teamId,
          `groups/${vars.groupId}/task-lists/${vars.taskListId}/recurring/${vars.recurringId}`,
          { method: 'PATCH', body: JSON.stringify(vars.body) },
          '할 일 수정에 실패했습니다.',
        );
      }

      // ✅ 일반 task 수정
      return fetchJson<Task>(
        teamId,
        `groups/${vars.groupId}/task-lists/${vars.taskListId}/tasks/${vars.taskId}`,
        { method: 'PATCH', body: JSON.stringify(vars.body) },
        '할 일 수정에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', teamId, vars.groupId, vars.taskListId],
        exact: false,
      });
      await qc.invalidateQueries({ queryKey: ['taskComments', teamId, vars.taskId] });
    },
  });
}

/**
 * ✅ 삭제:
 * - recurringId 있으면: /tasks/{taskId}/recurring/{recurringId}
 * - 없으면: /tasks/{taskId}
 */
export function useDeleteTask(teamId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      groupId: number;
      taskListId: number;
      taskId: number;
      recurringId?: number;
    }) => {
      if (vars.recurringId) {
        return fetchVoid(
          teamId,
          `groups/${vars.groupId}/task-lists/${vars.taskListId}/tasks/${vars.taskId}/recurring/${vars.recurringId}`,
          { method: 'DELETE' },
          '할 일 삭제에 실패했습니다.',
        );
      }

      return fetchVoid(
        teamId,
        `groups/${vars.groupId}/task-lists/${vars.taskListId}/tasks/${vars.taskId}`,
        { method: 'DELETE' },
        '할 일 삭제에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', teamId, vars.groupId, vars.taskListId],
        exact: false,
      });
      await qc.invalidateQueries({ queryKey: ['taskComments', teamId, vars.taskId] });
    },
  });
}

export function useCreateTaskComment(teamId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { taskId: number; content: string }) => {
      return fetchJson<Comment>(
        teamId,
        `tasks/${vars.taskId}/comments`,
        { method: 'POST', body: JSON.stringify({ content: vars.content }) },
        '댓글 작성에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['taskComments', teamId, vars.taskId] });
    },
  });
}
