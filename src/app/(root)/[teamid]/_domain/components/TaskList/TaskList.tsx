'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

import styles from './TaskList.module.css';

import {
  type ApiFrequency,
  type Task,
  useCreateTask,
  useCreateTaskComment,
  useCreateTaskList,
  useDeleteTask,
  useDeleteTaskList,
  useGroupDetail,
  useMe,
  usePatchTask,
  useTaskComments,
  useTaskListByDate,
  useUpdateTaskList,
} from './queries';

import TeamHeader from '@/components/team-header';
import WeekDateBar from '@/components/calendar/CalendarButton/WeekDateBar';
import TaskListItem from '@/components/list/TaskListItem';
import FloatingButton from '@/components/Button/domain/FloatingButton/FloatingButton';
import ArrowButton from '@/components/Button/domain/ArrowButton/ArrowButton';
import TodoCard from '@/components/todo-card/TodoCard';
import type { TodoItem } from '@/components/todo-card/types/types';
import GnbAddButton from '@/components/Button/domain/GnbAddButton/GnbAddButton';
import calendarIcon from '@/assets/icons/calender/calenderSmall.svg';
import downArrowSmall from '@/assets/icons/arrow/downArrowSmall.svg';
import TaskDetailCard from '@/components/Card/TaskDetailCard/TaskDetailCard';
import CalenderModal from '@/components/Modal/domain/components/Calender/CalenderModal';
import type { CalenderModalSubmitPayload } from '@/components/Modal/domain/components/Calender/types/CalenderModal.types';
import AddTodoList from '@/components/Modal/domain/components/AddTodoList/AddTodoList';
import Calendar from '@/components/calendar/Calendar';

/* =========================p
   helpers
   ========================= */

function isOpenDetailBlockedTarget(target: HTMLElement | null) {
  if (!target) return false;

  if (target.closest('button, a, input, textarea, select, [role="button"]')) return true;
  if (target.closest('[role="checkbox"]')) return true;
  if (target.closest('[aria-checked]')) return true;

  const labeled = target.closest('[aria-label]') as HTMLElement | null;
  if (labeled) {
    const v = (labeled.getAttribute('aria-label') ?? '').toLowerCase();
    if (
      v.includes('체크') ||
      v.includes('완료') ||
      v.includes('더보기') ||
      v.includes('kebab') ||
      v.includes('케밥')
    )
      return true;
  }

  const cls = (target.className ?? '').toString().toLowerCase();
  if (cls.includes('checkbox') || cls.includes('kebab') || cls.includes('more')) return true;

  if (target.tagName.toLowerCase() === 'svg' || target.tagName.toLowerCase() === 'path') {
    const p = target.parentElement;
    if (p && isOpenDetailBlockedTarget(p)) return true;
  }

  return false;
}

function isKebabTrigger(target: HTMLElement | null) {
  if (!target) return false;

  const labeled = target.closest('[aria-label]') as HTMLElement | null;
  if (labeled) {
    const v = (labeled.getAttribute('aria-label') ?? '').toLowerCase();
    if (v.includes('kebab') || v.includes('더보기') || v.includes('케밥')) return true;
  }

  const cls = (target.className ?? '').toString().toLowerCase();
  if (cls.includes('kebab') || cls.includes('more')) return true;

  if (target.tagName.toLowerCase() === 'svg' || target.tagName.toLowerCase() === 'path') {
    const p = target.parentElement;
    if (p && isKebabTrigger(p)) return true;
  }

  return false;
}

function formatYearMonth(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

// ✅ 주 단위 이동용
function addDays(base: Date, diff: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + diff);
  return d;
}
function addWeeks(base: Date, diff: number) {
  return addDays(base, diff * 7);
}

function toDateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function tzOffsetString(date: Date) {
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const hh = Math.floor(abs / 60);
  const mm = abs % 60;
  return `${sign}${pad2(hh)}:${pad2(mm)}`;
}
function toIsoWithOffset(date: Date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}${tzOffsetString(date)}`;
}
function toLocalNoonIso(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return toIsoWithOffset(d);
}

function formatKoreanDateOnly(isoOrKey?: string) {
  const raw = (isoOrKey ?? '').trim();
  if (!raw) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map((v) => Number(v));
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d))
      return `${y}년 ${m}월 ${d}일`;
    return raw;
  }

  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return raw;

  return `${dt.getFullYear()}년 ${dt.getMonth() + 1}월 ${dt.getDate()}일`;
}

function formatHHmmFromIso(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function parseTimeToHM(input?: string): { hh: number; mm: number } {
  const raw = (input ?? '').trim();
  if (!raw) return { hh: 9, mm: 0 };

  const ko = raw.match(/(오전|오후)\s*(\d{1,2})\s*:\s*(\d{2})/);
  if (ko) {
    const ap = ko[1];
    let h = Number(ko[2]);
    const m = Number(ko[3]);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return { hh: 9, mm: 0 };
    if (ap === '오후' && h < 12) h += 12;
    if (ap === '오전' && h === 12) h = 0;
    return { hh: h, mm: m };
  }

  const plain = raw.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (plain) {
    const h = Number(plain[1]);
    const m = Number(plain[2]);
    if (Number.isFinite(h) && Number.isFinite(m)) return { hh: h, mm: m };
  }

  return { hh: 9, mm: 0 };
}

type UiFrequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
function toUiFrequency(freq?: ApiFrequency): UiFrequency {
  if (freq === 'DAILY') return 'DAILY';
  if (freq === 'WEEKLY') return 'WEEKLY';
  if (freq === 'MONTHLY') return 'MONTHLY';
  return 'ONCE';
}

function safeDateFromPayload(v: unknown, fallback: Date) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return fallback;
}

type TodoCardData = {
  id: number;
  key: string;
  title: string;
  expanded: boolean;
  items: TodoItem[];
};

/**
 * ✅ 서버 스웨거: weekDays는 string[]이 아니라 number[]
 * Monday=0 ~ Sunday=6 로 보냄
 */
type ApiWeekDayNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;
function toApiWeekDayNums(input: unknown): ApiWeekDayNum[] | undefined {
  if (!Array.isArray(input)) return undefined;

  const map: Record<string, ApiWeekDayNum> = {
    mon: 0,
    monday: 0,
    월: 0,
    월요일: 0,
    '1': 0,

    tue: 1,
    tuesday: 1,
    화: 1,
    화요일: 1,
    '2': 1,

    wed: 2,
    wednesday: 2,
    수: 2,
    수요일: 2,
    '3': 2,

    thu: 3,
    thursday: 3,
    목: 3,
    목요일: 3,
    '4': 3,

    fri: 4,
    friday: 4,
    금: 4,
    금요일: 4,
    '5': 4,

    sat: 5,
    saturday: 5,
    토: 5,
    토요일: 5,
    '6': 5,

    sun: 6,
    sunday: 6,
    일: 6,
    일요일: 6,
    '0': 6,
    '7': 6,
  };

  const out: ApiWeekDayNum[] = [];
  for (const v of input) {
    if (typeof v !== 'string' && typeof v !== 'number') continue;
    const s = String(v).trim();
    const lower = s.toLowerCase();
    const mapped = map[lower] ?? map[s];
    if (mapped !== undefined && !out.includes(mapped)) out.push(mapped);
  }
  return out.length > 0 ? out : undefined;
}

function getTaskIso(task: Task | null | undefined) {
  const t = task as unknown as
    | { date?: string; startDate?: string; startAt?: string; scheduledAt?: string }
    | null
    | undefined;
  return t?.startDate ?? t?.date ?? t?.startAt ?? t?.scheduledAt ?? '';
}

function normalizeFreq(v: unknown): ApiFrequency {
  const raw = typeof v === 'string' ? v.trim().toUpperCase() : '';
  if (raw === 'DAILY') return 'DAILY';
  if (raw === 'WEEKLY') return 'WEEKLY';
  if (raw === 'MONTHLY') return 'MONTHLY';
  return 'ONCE';
}

function getTaskFrequency(task: Task | null | undefined): ApiFrequency {
  const t = task as unknown as
    | { frequency?: unknown; frequencyType?: unknown; repeatType?: unknown }
    | null
    | undefined;

  return normalizeFreq(t?.frequencyType ?? t?.frequency ?? t?.repeatType);
}

function getTaskWeekDays(task: Task | null | undefined): number[] | undefined {
  const t = task as unknown as
    | { weekDays?: number[]; repeatWeekDays?: number[]; repeatDays?: unknown }
    | null
    | undefined;

  if (Array.isArray(t?.weekDays) && t?.weekDays.length) return t.weekDays;
  if (Array.isArray(t?.repeatWeekDays) && t?.repeatWeekDays.length) return t.repeatWeekDays;
  return toApiWeekDayNums(t?.repeatDays);
}

function getTaskMonthDay(task: Task | null | undefined): number | undefined {
  const t = task as unknown as { monthDay?: number; repeatMonthDay?: number } | null | undefined;
  return t?.monthDay ?? t?.repeatMonthDay;
}

function normalizeIsoForUi(isoLike: string, fallbackDateKey: string) {
  const raw = (isoLike ?? '').trim();
  if (!raw) return toIsoWithOffset(new Date(`${fallbackDateKey}T09:00:00`));
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return toIsoWithOffset(new Date(`${raw}T09:00:00`));
  return raw;
}

function weekDayKorNum(d: number) {
  if (d === 0) return '월';
  if (d === 1) return '화';
  if (d === 2) return '수';
  if (d === 3) return '목';
  if (d === 4) return '금';
  if (d === 5) return '토';
  return '일';
}

function frequencyLabelFromTask(task: Task | null | undefined, fallbackDateKey: string) {
  const freq = getTaskFrequency(task);

  if (freq === 'DAILY') return '매일 반복';

  if (freq === 'WEEKLY') {
    const days = getTaskWeekDays(task);
    if (days && days.length > 0) return `매주 반복(${days.map(weekDayKorNum).join(',')})`;
    return '매주 반복';
  }

  if (freq === 'MONTHLY') {
    const md = getTaskMonthDay(task);
    if (typeof md === 'number' && Number.isFinite(md)) return `매월 반복(${md}일)`;

    const iso = normalizeIsoForUi(getTaskIso(task), fallbackDateKey);
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return `매월 반복(${d.getDate()}일)`;
    return '매월 반복';
  }

  return undefined;
}

function toModalRepeatDays(days?: number[]) {
  if (!days || days.length === 0) return [];
  const map: Record<number, string> = {
    0: 'mon',
    1: 'tue',
    2: 'wed',
    3: 'thu',
    4: 'fri',
    5: 'sat',
    6: 'sun',
  };
  return days.map((d) => map[d]).filter(Boolean);
}

const EDIT_TEAM_PATH = (groupId: number) => `/teams/${groupId}/edit`;
type CreateTaskListResult = { id: number };

export default function List() {
  const router = useRouter();
  const qc = useQueryClient();

  //  [teamid] 라우트에서 teamId 받음
  const params = useParams<{ teamid?: string }>();
  const teamId = String(params?.teamid ?? '').trim();

  const { data: me } = useMe(teamId);

  const groups = useMemo(() => {
    const list =
      (me?.memberships ?? [])
        .map((m) => m.group)
        .filter((g, idx, arr) => arr.findIndex((x) => x.id === g.id) === idx) ?? [];
    return list;
  }, [me?.memberships]);

  const activeGroupId = useMemo(() => groups[0]?.id ?? 0, [groups]);
  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  const groupDetailQuery = useGroupDetail(teamId, activeGroupId) as unknown as {
    data?: { taskLists?: Array<{ id: number; name: string; displayIndex: number }> };
    isLoading?: boolean;
    isFetching?: boolean;
  };
  const groupDetail = groupDetailQuery.data;
  const isGroupDetailLoading = !!groupDetailQuery.isLoading;
  const isGroupDetailFetching = !!groupDetailQuery.isFetching;

  const isGroupDetailReady = !!groupDetail && !isGroupDetailLoading && !isGroupDetailFetching;
  const taskLists = useMemo(() => groupDetail?.taskLists ?? [], [groupDetail?.taskLists]);

  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const selectedDateIso = useMemo(() => toLocalNoonIso(selectedDate), [selectedDate]);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarWrapRef = useRef<HTMLDivElement | null>(null);
  const toggleCalendar = () => setCalendarOpen((p) => !p);
  const closeCalendar = () => setCalendarOpen(false);

  const firstTaskListId = useMemo(() => {
    const sorted = [...taskLists].sort((a, b) => a.displayIndex - b.displayIndex);
    return sorted[0]?.id ?? 0;
  }, [taskLists]);

  const [selectedTaskListIdState, setSelectedTaskListIdState] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    queueMicrotask(() => setSelectedTaskListIdState(undefined));
  }, [activeGroupId]);

  const selectedTaskListId = selectedTaskListIdState ?? firstTaskListId;
  const selectedTodoKey = selectedTaskListId ? `taskList-${selectedTaskListId}` : 'taskList-0';

  const { data: taskListByDate } = useTaskListByDate({
    teamId,
    groupId: activeGroupId,
    taskListId: selectedTaskListId,
    dateIso: selectedDateIso,
  });
  const tasks = useMemo(() => taskListByDate?.tasks ?? [], [taskListByDate?.tasks]);

  const todoCardsWithPreview: TodoCardData[] = useMemo(() => {
    if (!isGroupDetailReady) return [];

    const sorted = [...taskLists].sort((a, b) => a.displayIndex - b.displayIndex);

    if (sorted.length === 0) {
      return [{ id: 0, key: 'taskList-0', title: '제목 없음', expanded: false, items: [] }];
    }

    return sorted.map((tl) => {
      const isSelected = tl.id === selectedTaskListId;
      const previewSrc = isSelected ? tasks : [];
      const preview: TodoItem[] = previewSrc.slice(0, 3).map((t) => ({
        id: String(t.id),
        text: t.name,
        checked: !!t.doneAt,
      }));

      return {
        id: tl.id,
        key: `taskList-${tl.id}`,
        title: tl.name,
        expanded: false,
        items: preview,
      };
    });
  }, [taskLists, tasks, selectedTaskListId, isGroupDetailReady]);

  const selectedTodo = useMemo(() => {
    if (!isGroupDetailReady)
      return { id: 0, key: 'taskList-0', title: '', expanded: false, items: [] };

    return (
      todoCardsWithPreview.find((c) => c.key === selectedTodoKey) ??
      todoCardsWithPreview[0] ?? {
        id: 0,
        key: 'taskList-0',
        title: '제목 없음',
        expanded: false,
        items: [],
      }
    );
  }, [todoCardsWithPreview, selectedTodoKey, isGroupDetailReady]);

  const [selectedTaskIdState, setSelectedTaskIdState] = useState<number | undefined>(undefined);

  useEffect(() => {
    queueMicrotask(() => setSelectedTaskIdState(undefined));
  }, [selectedTaskListId, selectedDateIso]);

  const selectedTaskId =
    selectedTaskIdState && tasks.some((t) => t.id === selectedTaskIdState)
      ? selectedTaskIdState
      : (tasks[0]?.id ?? 0);

  const selectedTask: Task | null = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? tasks[0] ?? null,
    [tasks, selectedTaskId],
  );

  const [addTodoOpen, setAddTodoOpen] = useState(false);
  const [todoEditTarget, setTodoEditTarget] = useState<TodoCardData | null>(null);
  const [todoNameDraft, setTodoNameDraft] = useState('');

  const openTodoCreate = () => {
    setTodoEditTarget(null);
    setTodoNameDraft('');
    setAddTodoOpen(true);
  };

  const openTodoEdit = (card: TodoCardData) => {
    setTodoEditTarget(card);
    setTodoNameDraft(card.title === '제목 없음' ? '' : card.title);
    setAddTodoOpen(true);
  };

  const createTaskList = useCreateTaskList(teamId);
  const updateTaskList = useUpdateTaskList(teamId);
  const deleteTaskList = useDeleteTaskList(teamId);

  const handleSubmitTodoModal = async () => {
    const name = todoNameDraft.trim();
    if (!name) return;
    if (!activeGroupId) return;

    if (!todoEditTarget || todoEditTarget.id === 0) {
      const createdUnknown = await createTaskList.mutateAsync({ groupId: activeGroupId, name });
      const created = createdUnknown as unknown as CreateTaskListResult;
      if (created?.id) setSelectedTaskListIdState(created.id);
    } else {
      await updateTaskList.mutateAsync({
        groupId: activeGroupId,
        taskListId: todoEditTarget.id,
        name,
      });
      setSelectedTaskListIdState(todoEditTarget.id);
    }

    setAddTodoOpen(false);
    setTodoEditTarget(null);
    setTodoNameDraft('');
  };

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [taskEditTarget, setTaskEditTarget] = useState<Task | null>(null);

  const openTaskCreate = () => {
    setTaskEditTarget(null);
    setCalendarModalOpen(true);
  };

  const openTaskEdit = (task: Task) => {
    setTaskEditTarget(task);
    setCalendarModalOpen(true);
  };

  const createTask = useCreateTask(teamId);
  const patchTask = usePatchTask(teamId);
  const deleteTask = useDeleteTask(teamId);

  const invalidateCurrentList = async () => {
    await qc.invalidateQueries({
      queryKey: ['taskListByDate', teamId, activeGroupId, selectedTaskListId, selectedDateIso],
    });
  };

  const handleCalendarSubmit = async (payload: CalenderModalSubmitPayload) => {
    const title = (payload.todoTitle ?? '').trim();
    const memo = (payload.memo ?? '').trim();
    if (!title) return;
    if (!activeGroupId || !selectedTaskListId) return;

    const freq: ApiFrequency =
      payload.repeatType === 'daily'
        ? 'DAILY'
        : payload.repeatType === 'weekly'
          ? 'WEEKLY'
          : payload.repeatType === 'monthly'
            ? 'MONTHLY'
            : 'ONCE';

    const base = safeDateFromPayload(
      (payload as unknown as { startDate?: unknown }).startDate,
      selectedDate,
    );

    const start = new Date(base);
    const { hh, mm } = parseTimeToHM(payload.startTime);
    start.setHours(hh, mm, 0, 0);

    const rawRepeatDays = (payload as unknown as { repeatDays?: unknown }).repeatDays;

    // ✅ WEEKLY: number[]
    const weekDays = freq === 'WEEKLY' ? toApiWeekDayNums(rawRepeatDays) : undefined;

    // ✅ MONTHLY: monthDay 필요
    const monthDay = freq === 'MONTHLY' ? start.getDate() : undefined;

    const startIso = toIsoWithOffset(start);

    // ✅ CREATE는 /recurring 로 보냄(신규 API)
    if (!taskEditTarget) {
      await createTask.mutateAsync({
        groupId: activeGroupId,
        taskListId: selectedTaskListId,
        name: title,
        description: memo,
        startDate: startIso,
        frequencyType: freq,
        weekDays,
        monthDay,
      });

      await invalidateCurrentList();
      setCalendarModalOpen(false);
      setTaskEditTarget(null);
      return;
    }

    // ✅ EDIT: recurringId 있으면 recurring 수정, 없으면 task PATCH
    await patchTask.mutateAsync({
      groupId: activeGroupId,
      taskListId: selectedTaskListId,
      taskId: taskEditTarget.id,
      recurringId: taskEditTarget.recurringId ?? undefined,
      body: {
        name: title,
        description: memo,
        startDate: startIso,
        frequencyType: freq,
        weekDays,
        monthDay,
      },
    });

    await invalidateCurrentList();
    setCalendarModalOpen(false);
    setTaskEditTarget(null);
  };

  const [openedTaskMenuId, setOpenedTaskMenuId] = useState<number | null>(null);
  const [openedTodoMenuKey, setOpenedTodoMenuKey] = useState<string | null>(null);
  const [todoListDropdownOpen, setTodoListDropdownOpen] = useState(false);
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);

  useEffect(() => {
    const onDoc = (ev: globalThis.MouseEvent) => {
      const t = ev.target as HTMLElement | null;
      if (!t) return;

      if (calendarOpen) {
        if (t.closest(`.${styles.calendarPopover}`) || t.closest(`.${styles.calendarBtn}`)) {
          // no-op
        } else {
          setCalendarOpen(false);
        }
      }

      if (t.closest(`.${styles.taskMenu}`) || t.closest(`.${styles.kebabMenu}`)) return;
      if (isKebabTrigger(t)) return;

      if (openedTaskMenuId !== null) setOpenedTaskMenuId(null);
      if (openedTodoMenuKey !== null) setOpenedTodoMenuKey(null);

      if (todoListDropdownOpen) {
        if (t.closest(`.${styles.todoListDropdown}`)) return;

        const labeled = t.closest('[aria-label]') as HTMLElement | null;
        const label = (labeled?.getAttribute('aria-label') ?? '').toLowerCase();
        if (label.includes('할 일 목록 열기')) return;

        setTodoListDropdownOpen(false);
      }

      if (teamMenuOpen) {
        if (t.closest(`.${styles.teamMenu}`)) return;
        if (t.closest('[class*="TeamHeader-module__"][class*="settingBig"]')) return;
        setTeamMenuOpen(false);
      }
    };

    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [openedTaskMenuId, openedTodoMenuKey, todoListDropdownOpen, teamMenuOpen, calendarOpen]);

  const handleSelectTodoList = (key: string) => {
    const id = Number(key.replace('taskList-', ''));
    if (!Number.isFinite(id) || id <= 0) return;

    setSelectedTaskListIdState(id);
    setTodoListDropdownOpen(false);
    setOpenedTodoMenuKey(null);
    setOpenedTaskMenuId(null);
    setSelectedTaskIdState(undefined);
  };

  // ✅ Detail Overlay
  const [detailMounted, setDetailMounted] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = () => {
    setDetailMounted(true);
    requestAnimationFrame(() => setDetailOpen(true));
  };

  const closeDetail = () => {
    setDetailOpen(false);
    window.setTimeout(() => setDetailMounted(false), 260);
  };

  const handleOpenDetail = (taskId: number) => {
    if (!taskId) return;

    setOpenedTaskMenuId(null);
    setOpenedTodoMenuKey(null);

    if (detailMounted && detailOpen && taskId === selectedTaskId) {
      closeDetail();
      return;
    }
    setSelectedTaskIdState(taskId);
    openDetail();
  };

  const { data: detailComments = [] } = useTaskComments(teamId, selectedTaskId);
  const createComment = useCreateTaskComment(teamId);

  const meWriter = useMemo(() => {
    return {
      id: me?.id ?? 0,
      nickname: me?.nickname ?? '',
      image: me?.image ? me.image : null,
    };
  }, [me]);

  const handleToggleDone = async (taskId: number, nextDone: boolean) => {
    if (!activeGroupId || !selectedTaskListId) return;

    // ✅ doneAt은 task PATCH로만 처리(반복/비반복 공통)
    await patchTask.mutateAsync({
      groupId: activeGroupId,
      taskListId: selectedTaskListId,
      taskId,
      recurringId: undefined,
      body: { doneAt: nextDone ? new Date().toISOString() : null },
    });

    await invalidateCurrentList();
  };

  const handleDeleteTask = async (task: Task) => {
    if (!activeGroupId || !selectedTaskListId) return;

    await deleteTask.mutateAsync({
      groupId: activeGroupId,
      taskListId: selectedTaskListId,
      taskId: task.id,
      recurringId: task.recurringId ?? undefined,
    });

    await invalidateCurrentList();
    if (detailMounted && selectedTaskId === task.id) closeDetail();
  };

  const deleteGroup = async (groupId: number) => {
    console.warn('TODO: deleteGroup API not wired', groupId);
    await qc.invalidateQueries({ queryKey: ['me', teamId] });
  };

  const handleClickTeamEdit = () => {
    if (!activeGroupId) return;
    setTeamMenuOpen(false);
    router.push(EDIT_TEAM_PATH(activeGroupId));
  };

  const handleClickTeamDelete = async () => {
    if (!activeGroupId) return;
    setTeamMenuOpen(false);

    const ok = window.confirm('정말 팀을 삭제할까요? (삭제 시 복구 불가)');
    if (!ok) return;

    await deleteGroup(activeGroupId);
  };

  const hasRealTaskList = isGroupDetailReady && taskLists.length > 0;

  const selectedIso = normalizeIsoForUi(getTaskIso(selectedTask), selectedDateKey);
  const selectedFreq = getTaskFrequency(selectedTask);

  const handleTeamHeaderClickCapture = (e: ReactMouseEvent) => {
    const t = e.target as HTMLElement | null;
    if (!t) return;

    if (t.closest('[class*="TeamHeader-module__"][class*="settingBig"]')) {
      e.preventDefault();
      e.stopPropagation();
      setTeamMenuOpen((p) => !p);
    }
  };

  const calendarInitialValues = useMemo(() => {
    if (!taskEditTarget) {
      return { startDate: selectedDate, startTime: '09:00', repeatType: 'none', repeatDays: [] };
    }

    const iso = normalizeIsoForUi(getTaskIso(taskEditTarget), selectedDateKey);
    const dt = new Date(iso);
    const freq = getTaskFrequency(taskEditTarget);
    const startDate = Number.isNaN(dt.getTime()) ? selectedDate : dt;

    return {
      todoTitle: taskEditTarget.name ?? '',
      memo: taskEditTarget.description ?? '',
      startDate,
      startTime: formatHHmmFromIso(iso) || '09:00',
      repeatType:
        freq === 'DAILY'
          ? 'daily'
          : freq === 'WEEKLY'
            ? 'weekly'
            : freq === 'MONTHLY'
              ? 'monthly'
              : 'none',
      repeatDays: freq === 'WEEKLY' ? toModalRepeatDays(getTaskWeekDays(taskEditTarget)) : [],
    };
  }, [taskEditTarget, selectedDate, selectedDateKey]);

  if (!teamId) {
    return (
      <main className={styles.page}>
        <div style={{ padding: 24 }}>teamId 경로가 비어있습니다.</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <style jsx global>{`
        .TaskDetailCard-module__8btaCa__title {
          margin: 0 !important;
        }
      `}</style>

      <section className={styles.mainContents}>
        <div className={styles.stage}>
          <div
            className={styles.teamHeaderPad}
            style={{ position: 'relative' }}
            onClickCapture={handleTeamHeaderClickCapture}
          >
            <TeamHeader variant="list" teamName={activeGroup?.name ?? ''} settingsHref="" />

            {teamMenuOpen ? (
              <div className={styles.teamMenu} role="menu" aria-label="팀 설정 메뉴">
                <button type="button" className={styles.teamMenuItem} onClick={handleClickTeamEdit}>
                  수정하기
                </button>
                <button
                  type="button"
                  className={styles.teamMenuItem}
                  onClick={handleClickTeamDelete}
                >
                  삭제하기
                </button>
              </div>
            ) : null}
          </div>

          <section className={styles.mobileTodoSection} aria-label="할 일 목록">
            <span className={styles.mobileTodoLabel}>할 일</span>

            <div className={styles.mobileTodoRow}>
              <div className={styles.mobileTodoInlineCard}>
                <div className={styles.todoCardWrap}>
                  <button
                    type="button"
                    className={styles.todoArrowBtn}
                    aria-label="할 일 목록 열기"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTodoListDropdownOpen((prev) => !prev);
                      setOpenedTodoMenuKey(null);
                    }}
                  >
                    <Image src={downArrowSmall} alt="" width={16} height={16} />
                  </button>

                  <div className={styles.todoCardShell}>
                    <div
                      className={`${styles.todoCardShellInner} ${styles.todoCardShellCollapsed}`}
                    >
                      <TodoCard
                        title={selectedTodo.title}
                        items={selectedTodo.items}
                        expanded={false}
                        onKebabClick={() => {
                          if (selectedTodo.id === 0) {
                            openTodoCreate();
                            return;
                          }
                          setOpenedTodoMenuKey((prev) =>
                            prev === selectedTodo.key ? null : selectedTodo.key,
                          );
                          setTodoListDropdownOpen(false);
                        }}
                        onItemCheckedChange={() => {}}
                      />
                    </div>
                  </div>

                  {openedTodoMenuKey === selectedTodo.key && selectedTodo.id !== 0 ? (
                    <div className={styles.kebabMenu} role="menu" aria-label="할 일 목록 메뉴">
                      <button
                        type="button"
                        className={styles.kebabItem}
                        onClick={() => {
                          setOpenedTodoMenuKey(null);
                          openTodoEdit(selectedTodo);
                        }}
                      >
                        수정하기
                      </button>
                      <button
                        type="button"
                        className={styles.kebabItem}
                        onClick={async () => {
                          setOpenedTodoMenuKey(null);
                          if (!activeGroupId) return;

                          await deleteTaskList.mutateAsync({
                            groupId: activeGroupId,
                            taskListId: selectedTodo.id,
                          });

                          if (selectedTaskListId === selectedTodo.id) {
                            setSelectedTaskListIdState(undefined);
                            setSelectedTaskIdState(undefined);
                          }
                        }}
                      >
                        삭제하기
                      </button>
                    </div>
                  ) : null}

                  {todoListDropdownOpen ? (
                    <div
                      className={styles.todoListDropdown}
                      role="listbox"
                      aria-label="할 일 목록 선택"
                    >
                      {todoCardsWithPreview.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          role="option"
                          className={styles.todoListOption}
                          aria-selected={c.key === selectedTodoKey}
                          onClick={() => {
                            if (c.id === 0) {
                              openTodoCreate();
                              setTodoListDropdownOpen(false);
                              return;
                            }
                            handleSelectTodoList(c.key);
                          }}
                        >
                          {c.title}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className={styles.mobileAddBtnWrap}>
                  <GnbAddButton label="할일 추가" onClick={openTodoCreate} />
                </div>
              </div>
            </div>
          </section>

          <div className={styles.body}>
            <section className={styles.leftCol} aria-label="할 일 목록(PC)">
              <h3 className={styles.leftTitle}>할 일</h3>

              <div className={styles.todoList}>
                {todoCardsWithPreview.map((card) => (
                  <div key={card.key} className={styles.todoCardWrap}>
                    <div
                      className={styles.todoCardShell}
                      onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                        const t = e.target as HTMLElement | null;
                        if (!t) return;
                        if (isKebabTrigger(t)) return;

                        if (card.id === 0) {
                          openTodoCreate();
                          return;
                        }
                        handleSelectTodoList(card.key);
                      }}
                    >
                      <div className={styles.todoCardShellInner}>
                        <TodoCard
                          title={card.title}
                          items={card.items}
                          expanded={card.expanded}
                          onKebabClick={() => {
                            if (card.id === 0) {
                              openTodoCreate();
                              return;
                            }
                            setOpenedTodoMenuKey((prev) => (prev === card.key ? null : card.key));
                          }}
                          onItemCheckedChange={() => {}}
                        />
                      </div>
                    </div>

                    {openedTodoMenuKey === card.key && card.id !== 0 ? (
                      <div className={styles.kebabMenu} role="menu" aria-label="할 일 목록 메뉴">
                        <button
                          type="button"
                          className={styles.kebabItem}
                          onClick={() => {
                            setOpenedTodoMenuKey(null);
                            openTodoEdit(card);
                          }}
                        >
                          수정하기
                        </button>
                        <button
                          type="button"
                          className={styles.kebabItem}
                          onClick={async () => {
                            setOpenedTodoMenuKey(null);
                            if (!activeGroupId) return;

                            await deleteTaskList.mutateAsync({
                              groupId: activeGroupId,
                              taskListId: card.id,
                            });

                            if (selectedTaskListId === card.id) {
                              setSelectedTaskListIdState(undefined);
                              setSelectedTaskIdState(undefined);
                            }
                          }}
                        >
                          삭제하기
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className={styles.leftAddWrap}>
                <button type="button" className={styles.leftAddBtn} onClick={openTodoCreate}>
                  + 할일 추가
                </button>
              </div>
            </section>

            <section className={styles.rightWrap} aria-label="선택된 목록의 할 일">
              <div className={styles.rightPanel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>
                    {isGroupDetailReady ? selectedTodo.title : ''}
                  </h2>

                  <div className={styles.panelControls}>
                    <span className={styles.yearMonth}>{formatYearMonth(viewDate)}</span>

                    {/* ✅ 주 단위 이동 */}
                    <div className={styles.arrowGroup}>
                      <ArrowButton
                        size="small"
                        direction="left"
                        onClick={() => setViewDate((d) => addWeeks(d, -1))}
                      />
                      <ArrowButton
                        size="small"
                        direction="right"
                        onClick={() => setViewDate((d) => addWeeks(d, 1))}
                      />
                    </div>

                    <div ref={calendarWrapRef} style={{ position: 'relative' }}>
                      <button
                        type="button"
                        className={styles.calendarBtn}
                        aria-label="달력"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCalendar();
                        }}
                      >
                        <Image src={calendarIcon} alt="" width={16} height={16} />
                      </button>

                      {calendarOpen ? (
                        <div className={styles.calendarPopover} role="dialog" aria-modal="false">
                          <Calendar
                            value={selectedDate}
                            onChange={(v) => {
                              if (v) {
                                setSelectedDate(v);
                                setViewDate(v); // ✅ 달력 선택 시 viewDate도 동기화
                              }
                              closeCalendar();
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className={styles.weekBar}>
                  <WeekDateBar
                    viewDate={viewDate}
                    value={selectedDate}
                    onChange={(next) => {
                      setSelectedDate(next);
                      setViewDate(next); // ✅ 주바 선택 시 viewDate도 동기화
                    }}
                  />
                </div>

                {!isGroupDetailReady ? (
                  <div className={styles.taskList}>
                    <div style={{ padding: 12, opacity: 0.5 }}>불러오는 중...</div>
                  </div>
                ) : (
                  <div className={styles.taskList}>
                    {!hasRealTaskList || tasks.length === 0 ? (
                      <div
                        className={styles.taskRowClick}
                        onClick={() => (hasRealTaskList ? openTaskCreate() : openTodoCreate())}
                        role="button"
                        tabIndex={0}
                      >
                        <TaskListItem
                          title={
                            hasRealTaskList
                              ? '할 일을 추가해 주세요'
                              : '할 일 목록을 먼저 만들어 주세요'
                          }
                          date={formatKoreanDateOnly(selectedDateKey)}
                          checked={false}
                          isSelected={false}
                          commentCount={0}
                          frequency={undefined}
                          onCheckedChange={() => {}}
                          onKebabClick={() => {}}
                        />
                      </div>
                    ) : (
                      tasks.map((task) => {
                        const taskIso = normalizeIsoForUi(getTaskIso(task), selectedDateKey);

                        return (
                          <div
                            key={task.id}
                            className={styles.taskRowClick}
                            onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                              const t = e.target as HTMLElement | null;
                              if (isOpenDetailBlockedTarget(t)) return;
                              handleOpenDetail(task.id);
                            }}
                          >
                            <div style={{ position: 'relative' }}>
                              <TaskListItem
                                title={task.name}
                                date={formatKoreanDateOnly(taskIso)}
                                checked={!!task.doneAt}
                                isSelected={task.id === selectedTaskId}
                                commentCount={task.commentCount}
                                frequency={frequencyLabelFromTask(task, selectedDateKey)}
                                onCheckedChange={async (checked) => {
                                  await handleToggleDone(task.id, checked);
                                }}
                                onKebabClick={() => {
                                  setOpenedTaskMenuId((prev) =>
                                    prev === task.id ? null : task.id,
                                  );
                                }}
                              />

                              {openedTaskMenuId === task.id ? (
                                <ul className={styles.taskMenu} role="menu" aria-label="할 일 메뉴">
                                  <li>
                                    <button
                                      type="button"
                                      className={styles.taskMenuItem}
                                      onClick={() => {
                                        setOpenedTaskMenuId(null);
                                        openTaskEdit(task);
                                      }}
                                    >
                                      수정하기
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      type="button"
                                      className={styles.taskMenuItem}
                                      onClick={async () => {
                                        setOpenedTaskMenuId(null);
                                        await handleDeleteTask(task);
                                      }}
                                    >
                                      삭제하기
                                    </button>
                                  </li>
                                </ul>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div className={styles.fab}>
                <FloatingButton icon="plus" onClick={openTaskCreate} />
              </div>
            </section>
          </div>
        </div>

        {detailMounted && selectedTask ? (
          <div
            className={`${styles.detailOverlay} ${
              detailOpen ? styles.detailOpen : styles.detailClose
            }`}
            role="dialog"
            aria-modal="true"
            onClick={closeDetail}
          >
            <div
              className={styles.detailInner}
              data-done={selectedTask.doneAt ? 'true' : 'false'}
              onClick={(e) => e.stopPropagation()}
            >
              <TaskDetailCard
                id={selectedTask.id}
                name={selectedTask.name}
                description={selectedTask.description ?? ''}
                date={selectedIso}
                frequency={toUiFrequency(selectedFreq)}
                writer={{
                  id: selectedTask.writer?.id ?? meWriter.id,
                  nickname: selectedTask.writer?.nickname ?? meWriter.nickname,
                  image: selectedTask.writer?.image ?? meWriter.image,
                }}
                doneAt={(selectedTask.doneAt as string | null) ?? null}
                comments={detailComments}
                onComplete={async () => {
                  await handleToggleDone(selectedTask.id, !selectedTask.doneAt);
                }}
                onEdit={() => openTaskEdit(selectedTask)}
                onDelete={async () => {
                  await handleDeleteTask(selectedTask);
                }}
                onClose={closeDetail}
                onCommentSubmit={async (content) => {
                  const c = (content ?? '').trim();
                  if (!c) return;

                  await createComment.mutateAsync({ taskId: selectedTask.id, content: c });
                  await invalidateCurrentList();
                }}
              />
            </div>
          </div>
        ) : null}

        <AddTodoList
          isOpen={addTodoOpen}
          onClose={() => {
            setAddTodoOpen(false);
            setTodoEditTarget(null);
            setTodoNameDraft('');
          }}
          onSubmit={handleSubmitTodoModal}
          text={{
            title: '할 일 목록',
            submitLabel: todoEditTarget && todoEditTarget.id !== 0 ? '수정하기' : '만들기',
            inputPlaceholder: '할 일을 입력하세요',
          }}
          input={{
            props: {
              value: todoNameDraft,
              onChange: (e) => setTodoNameDraft(e.target.value),
              autoFocus: true,
            },
          }}
          closeOptions={{ overlayClick: true, escape: true }}
        />

        <CalenderModal
          isOpen={calendarModalOpen}
          onClose={() => {
            setCalendarModalOpen(false);
            setTaskEditTarget(null);
          }}
          onSubmit={handleCalendarSubmit}
          text={{
            title: taskEditTarget ? '할 일 수정하기' : '할 일 만들기',
            submitLabel: taskEditTarget ? '수정하기' : '만들기',
          }}
          initialValues={calendarInitialValues as unknown as never}
          closeOptions={{ overlayClick: true, escape: true }}
        />
      </section>
    </main>
  );
}
