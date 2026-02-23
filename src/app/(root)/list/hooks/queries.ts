'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** ===== helpers (프로젝트 proxy route 정책에 맞춤) ===== */
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

async function fetchJson<T>(path: string, init?: RequestInit, message = '요청 실패'): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const isBodyless = method === 'GET' || method === 'HEAD' || method === 'DELETE';

  const res = await fetch(proxy(path), {
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

async function fetchVoid(path: string, init?: RequestInit, message = '요청 실패'): Promise<void> {
  const method = (init?.method ?? 'GET').toUpperCase();

  const res = await fetch(proxy(path), {
    ...init,
    method,
    body: method === 'DELETE' || method === 'GET' || method === 'HEAD' ? undefined : init?.body,
    credentials: 'include',
  });

  await assertOk(res, message);
}

/** ===== types (swagger 기반 최소 필요 필드) ===== */
export type ApiFrequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type ApiWeekDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

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

  /** 서버가 date/startDate/startAt/scheduledAt 중 무엇을 주든 UI에서 흡수 가능하게 optional */
  date?: string; // ISO
  startDate?: string; // ISO
  startAt?: string;
  scheduledAt?: string;

  doneAt?: string | null;

  /** 서버가 frequency/frequencyType/repeatType 중 무엇을 주든 UI에서 흡수 가능 */
  frequency?: ApiFrequency;
  frequencyType?: ApiFrequency;
  repeatType?: ApiFrequency;

  /** 주/월 반복 부가 */
  weekDays?: ApiWeekDay[];
  repeatWeekDays?: ApiWeekDay[];
  repeatDays?: unknown; // 모달 포맷 들어올 수도 있어 방어

  monthDay?: number;
  repeatMonthDay?: number;

  commentCount: number;
  writer?: TaskWriter;
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
    queryFn: async () => {
      return fetchJson<UserResponse>('user', undefined, '유저 정보를 불러오는데 실패했습니다.');
    },
    staleTime: 30_000,
  });
}

export function useGroupDetail(groupId: number) {
  return useQuery({
    queryKey: ['groupDetail', groupId],
    enabled: groupId > 0,
    queryFn: async () => {
      return fetchJson<GroupDetailResponse>(
        `groups/${groupId}`,
        undefined,
        '그룹 정보를 불러오는데 실패했습니다.',
      );
    },
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
    queryFn: async () => {
      return fetchJson<TaskListByDateResponse>(
        `groups/${groupId}/task-lists/${taskListId}?date=${encodeURIComponent(dateIso)}`,
        { cache: 'no-store' },
        '할 일 목록을 불러오는데 실패했습니다.',
      );
    },
  });
}

export function useTaskComments(taskId: number) {
  return useQuery({
    queryKey: ['taskComments', taskId],
    enabled: taskId > 0,
    queryFn: async () => {
      return fetchJson<Comment[]>(
        `tasks/${taskId}/comments`,
        undefined,
        '댓글을 불러오는데 실패했습니다.',
      );
    },
  });
}

/** ===== mutations ===== */
export function useCreateTaskList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { groupId: number; name: string }) => {
      return fetchJson<TaskList>(
        `groups/${vars.groupId}/task-lists`,
        { method: 'POST', body: JSON.stringify({ name: vars.name }) },
        '할 일 목록 생성에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['groupDetail', vars.groupId] });
    },
  });
}

export function useUpdateTaskList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { groupId: number; taskListId: number; name: string }) => {
      return fetchJson<TaskList>(
        `groups/${vars.groupId}/task-lists/${vars.taskListId}`,
        { method: 'PATCH', body: JSON.stringify({ name: vars.name }) },
        '할 일 목록 수정에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['groupDetail', vars.groupId] });
      // dateIso까지 포함된 키도 같이 invalidate되도록 exact:false
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', vars.groupId, vars.taskListId],
        exact: false,
      });
    },
  });
}

export function useDeleteTaskList() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { groupId: number; taskListId: number }) => {
      return fetchVoid(
        `groups/${vars.groupId}/task-lists/${vars.taskListId}`,
        { method: 'DELETE' },
        '할 일 목록 삭제에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['groupDetail', vars.groupId] });
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', vars.groupId, vars.taskListId],
        exact: false,
      });
    },
  });
}

/** Task 생성 */
export function useCreateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      groupId: number;
      taskListId: number;
      name: string;
      description?: string;
      startDate: string; // ISO
      frequencyType: ApiFrequency;
      weekDays?: ApiWeekDay[];
      monthDay?: number;
    }) => {
      return fetchJson<Task>(
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
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', vars.groupId, vars.taskListId],
        exact: false,
      });
    },
  });
}

export function usePatchTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      groupId: number;
      taskListId: number;
      taskId: number;
      body: {
        name?: string;
        description?: string;
        startDate?: string; //
        frequencyType?: ApiFrequency;
        weekDays?: ApiWeekDay[];
        monthDay?: number;
        doneAt?: string | null;
      };
    }) => {
      return fetchJson<Task>(
        `groups/${vars.groupId}/task-lists/${vars.taskListId}/tasks/${vars.taskId}`,
        { method: 'PATCH', body: JSON.stringify(vars.body) },
        '할 일 수정에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', vars.groupId, vars.taskListId],
        exact: false,
      });
      await qc.invalidateQueries({ queryKey: ['taskComments', vars.taskId] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { groupId: number; taskListId: number; taskId: number }) => {
      return fetchVoid(
        `groups/${vars.groupId}/task-lists/${vars.taskListId}/tasks/${vars.taskId}`,
        { method: 'DELETE' },
        '할 일 삭제에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({
        queryKey: ['taskListByDate', vars.groupId, vars.taskListId],
        exact: false,
      });
      await qc.invalidateQueries({ queryKey: ['taskComments', vars.taskId] });
    },
  });
}

export function useCreateTaskComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { taskId: number; content: string }) => {
      return fetchJson<Comment>(
        `tasks/${vars.taskId}/comments`,
        { method: 'POST', body: JSON.stringify({ content: vars.content }) },
        '댓글 작성에 실패했습니다.',
      );
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ['taskComments', vars.taskId] });
    },
  });
}
