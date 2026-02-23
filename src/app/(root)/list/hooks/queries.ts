'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** ===== helpers ===== */
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

async function fetchJson<T>(path: string, init?: RequestInit, message = '요청 실패'): Promise<T> {
  const res = await fetch(proxy(path), {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  await assertOk(res, message);
  return (await res.json()) as T;
}

async function fetchVoid(path: string, init?: RequestInit, message = '요청 실패'): Promise<void> {
  const res = await fetch(proxy(path), init);
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

export type Task = {
  id: number;
  name: string;
  description: string | null;
  date: string; // ISO
  doneAt: string | null;
  frequency: ApiFrequency;
  commentCount: number;
  writer?: { id: number; nickname: string; image: string | null } | null;
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
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () =>
      fetchJson<UserResponse>('user', undefined, '유저 정보를 불러오는데 실패했습니다.'),
    staleTime: 30_000,
  });
}

export function useGroupDetail(groupId: number) {
  return useQuery({
    queryKey: ['groupDetail', groupId],
    enabled: groupId > 0,
    queryFn: () =>
      fetchJson<GroupDetailResponse>(
        `groups/${groupId}`,
        undefined,
        '그룹 정보를 불러오는데 실패했습니다.',
      ),
    staleTime: 10_000,
  });
}

export function useTaskListByDate(params: {
  groupId: number;
  taskListId: number;
  dateIso: string;
}) {
  const { groupId, taskListId, dateIso } = params;

  return useQuery({
    queryKey: ['taskListByDate', groupId, taskListId, dateIso],
    enabled: groupId > 0 && taskListId > 0 && !!dateIso,
    queryFn: () =>
      fetchJson<TaskListByDateResponse>(
        `groups/${groupId}/task-lists/${taskListId}?date=${encodeURIComponent(dateIso)}`,
        { cache: 'no-store' },
        '할 일 목록을 불러오는데 실패했습니다.',
      ),
  });
}

export function useTaskComments(taskId: number) {
  return useQuery({
    queryKey: ['taskComments', taskId],
    enabled: taskId > 0,
    queryFn: () =>
      fetchJson<Comment[]>(
        `tasks/${taskId}/comments`,
        undefined,
        '댓글을 불러오는데 실패했습니다.',
      ),
  });
}

/** ===== mutations ===== */
export function useCreateTaskList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { groupId: number; name: string }) =>
      fetchJson<TaskList>(
        `groups/${vars.groupId}/task-lists`,
        { method: 'POST', body: JSON.stringify({ name: vars.name }) },
        '할 일 목록 생성에 실패했습니다.',
      ),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['groupDetail', vars.groupId] });
    },
  });
}

export function useUpdateTaskList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { groupId: number; taskListId: number; name: string }) =>
      fetchJson<TaskList>(
        `groups/${vars.groupId}/task-lists/${vars.taskListId}`,
        { method: 'PATCH', body: JSON.stringify({ name: vars.name }) },
        '할 일 목록 수정에 실패했습니다.',
      ),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['groupDetail', vars.groupId] });
      await qc.invalidateQueries({ queryKey: ['taskListByDate', vars.groupId, vars.taskListId] });
    },
  });
}

export function useDeleteTaskList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { groupId: number; taskListId: number }) =>
      fetchVoid(
        `groups/${vars.groupId}/task-lists/${vars.taskListId}`,
        { method: 'DELETE' },
        '할 일 목록 삭제에 실패했습니다.',
      ),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['groupDetail', vars.groupId] });
      await qc.invalidateQueries({ queryKey: ['taskListByDate', vars.groupId, vars.taskListId] });
    },
  });
}

/**
 * TaskRecurringCreateDto 기반
 * - ONCE도 여기로 POST /tasks
 * - weekly/monthly면 weekDays/monthDay 전달 가능
 */
export function useCreateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      groupId: number;
      taskListId: number;
      name: string;
      description?: string;
      startDate: string; // ISO
      frequencyType: ApiFrequency;
      weekDays?: string[]; // ['MONDAY'...]
      monthDay?: number;
    }) =>
      fetchJson<Task>(
        `groups/${vars.groupId}/task-lists/${vars.taskListId}/tasks`,
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
      ),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['taskListByDate', vars.groupId, vars.taskListId] });
    },
  });
}

export function usePatchTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      groupId: number;
      taskListId: number;
      taskId: number;
      body: { name?: string; description?: string; date?: string; doneAt?: string | null };
    }) =>
      fetchJson<Task>(
        `groups/${vars.groupId}/task-lists/${vars.taskListId}/tasks/${vars.taskId}`,
        { method: 'PATCH', body: JSON.stringify(vars.body) },
        '할 일 수정에 실패했습니다.',
      ),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['taskListByDate', vars.groupId, vars.taskListId] });
      await qc.invalidateQueries({ queryKey: ['taskComments', vars.taskId] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { groupId: number; taskListId: number; taskId: number }) =>
      fetchVoid(
        `groups/${vars.groupId}/task-lists/${vars.taskListId}/tasks/${vars.taskId}`,
        { method: 'DELETE' },
        '할 일 삭제에 실패했습니다.',
      ),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['taskListByDate', vars.groupId, vars.taskListId] });
      await qc.invalidateQueries({ queryKey: ['taskComments', vars.taskId] });
    },
  });
}

export function useCreateTaskComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { taskId: number; content: string }) =>
      fetchJson<Comment>(
        `tasks/${vars.taskId}/comments`,
        { method: 'POST', body: JSON.stringify({ content: vars.content }) },
        '댓글 작성에 실패했습니다.',
      ),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['taskComments', vars.taskId] });
      // commentCount가 바뀌니까 리스트도 갱신 필요 (상위에서 invalidate 추가로 해도 됨)
    },
  });
}
