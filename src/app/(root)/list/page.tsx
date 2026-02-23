'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';

import styles from './list.module.css';

import Sidebar from '@/components/sidebar/Sidebar';
import TeamHeader from '@/components/team-header';
import MobileHeader from '@/components/sidebar/MobileHeader';
import MobileDrawer from '@/components/sidebar/MobileDrawer';

import SidebarButton from '@/components/sidebar/SidebarButton';
import SidebarAddButton from '@/components/sidebar/SidebarAddButton';

import WeekDateBar from '@/components/calendar/CalendarButton/WeekDateBar';

import TaskListItem from '@/components/list/TaskListItem';
import FloatingButton from '@/components/Button/domain/FloatingButton/FloatingButton';
import ArrowButton from '@/components/Button/domain/ArrowButton/ArrowButton';

import TodoCard from '@/components/todo-card/TodoCard';
import type { TodoItem } from '@/components/todo-card/types/types';

import GnbAddButton from '@/components/Button/domain/GnbAddButton/GnbAddButton';

import calendarIcon from '@/assets/icons/calender/calenderSmall.svg';
import chessSmall from '@/assets/icons/chess/chessSmall.svg';
import boardSmall from '@/assets/icons/board/boardSmall.svg';
import downArrowSmall from '@/assets/icons/arrow/downArrowSmall.svg';

import TaskDetailCard from '@/components/Card/TaskDetailCard/TaskDetailCard';

import CalenderModal from '@/components/Modal/domain/components/Calender/CalenderModal';
import type { CalenderModalSubmitPayload } from '@/components/Modal/domain/components/Calender/types/CalenderModal.types';

import AddTodoList from '@/components/Modal/domain/components/AddTodoList/AddTodoList';

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
} from '@/app/(root)/list/hooks/queries';

/** ✅ 체크박스/케밥/버튼 클릭이면 디테일 오픈 금지 */
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
    ) {
      return true;
    }
  }

  const cls = (target.className ?? '').toString().toLowerCase();
  if (cls.includes('checkbox') || cls.includes('kebab') || cls.includes('more')) return true;

  if (target.tagName.toLowerCase() === 'svg' || target.tagName.toLowerCase() === 'path') {
    const p = target.parentElement;
    if (p && isOpenDetailBlockedTarget(p)) return true;
  }

  return false;
}

function formatYearMonth(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function addMonths(base: Date, diff: number) {
  const d = new Date(base);
  d.setMonth(d.getMonth() + diff);
  return d;
}

function toDateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toIsoAtStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function frequencyLabel(freq?: ApiFrequency) {
  if (freq === 'DAILY') return '매일반복';
  if (freq === 'WEEKLY') return '매주반복';
  if (freq === 'MONTHLY') return '매월반복';
  return undefined;
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
  id: number; // taskListId
  key: string; // `taskList-${id}`
  title: string;
  expanded: boolean;
  items: TodoItem[];
};

export default function ListPage() {
  const qc = useQueryClient();
  const desktopSidebarRef = useRef<HTMLDivElement | null>(null);

  const [isPc, setIsPc] = useState(false);
  const [isMobileUi, setIsMobileUi] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mqPc = window.matchMedia('(min-width: 1025px)');
    const mqMobileUi = window.matchMedia('(max-width: 1024px)');

    const apply = () => {
      setIsPc(mqPc.matches);
      setIsMobileUi(mqMobileUi.matches);
    };

    apply();
    mqPc.addEventListener('change', apply);
    mqMobileUi.addEventListener('change', apply);

    return () => {
      mqPc.removeEventListener('change', apply);
      mqMobileUi.removeEventListener('change', apply);
    };
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen((p) => !p);
  const closeDrawer = () => setDrawerOpen(false);

  /** ===== me -> groups ===== */
  const { data: me } = useMe();

  const groups = useMemo(() => {
    const list =
      (me?.memberships ?? [])
        .map((m) => m.group)
        .filter((g, idx, arr) => arr.findIndex((x) => x.id === g.id) === idx) ?? [];
    return list;
  }, [me?.memberships]);

  /** ===== active group (effect 없이 fallback) ===== */
  const [activeGroupIdState, setActiveGroupIdState] = useState<number | undefined>(undefined);
  const activeGroupId = activeGroupIdState ?? groups[0]?.id ?? 0;

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  /** ===== group detail ===== */
  const { data: groupDetail } = useGroupDetail(activeGroupId);

  const taskLists = useMemo(() => groupDetail?.taskLists ?? [], [groupDetail?.taskLists]);
  // const members = useMemo(() => groupDetail?.members ?? [], [groupDetail?.members]); // 필요시 사용

  /** ===== dates ===== */
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const selectedDateIso = useMemo(() => toIsoAtStartOfDay(selectedDate), [selectedDate]);

  /** ===== selected taskList (effect 없이 fallback) ===== */
  const firstTaskListId = useMemo(() => {
    const sorted = [...taskLists].sort((a, b) => a.displayIndex - b.displayIndex);
    return sorted[0]?.id ?? 0;
  }, [taskLists]);

  const [selectedTaskListIdState, setSelectedTaskListIdState] = useState<number | undefined>(
    undefined,
  );
  const selectedTaskListId = selectedTaskListIdState ?? firstTaskListId;

  const selectedTodoKey = selectedTaskListId ? `taskList-${selectedTaskListId}` : '';

  /** ===== tasks by date ===== */
  const { data: taskListByDate } = useTaskListByDate({
    groupId: activeGroupId,
    taskListId: selectedTaskListId,
    dateIso: selectedDateIso,
  });

  const tasks = useMemo(() => taskListByDate?.tasks ?? [], [taskListByDate?.tasks]);

  /** ===== TodoCard preview (선택된 리스트만 3개 preview) ===== */
  const todoCardsWithPreview: TodoCardData[] = useMemo(() => {
    const sorted = [...taskLists].sort((a, b) => a.displayIndex - b.displayIndex);

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
  }, [taskLists, tasks, selectedTaskListId]);

  const selectedTodo = useMemo(
    () => todoCardsWithPreview.find((c) => c.key === selectedTodoKey) ?? todoCardsWithPreview[0],
    [todoCardsWithPreview, selectedTodoKey],
  );

  /** ===== selected task (effect 없이 안전 fallback) ===== */
  const [selectedTaskIdState, setSelectedTaskIdState] = useState<number | undefined>(undefined);
  const selectedTaskId =
    selectedTaskIdState && tasks.some((t) => t.id === selectedTaskIdState)
      ? selectedTaskIdState
      : (tasks[0]?.id ?? 0);

  const selectedTask: Task | null = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? tasks[0] ?? null,
    [tasks, selectedTaskId],
  );

  /** ===== modals: taskList ===== */
  const [addTodoOpen, setAddTodoOpen] = useState(false);
  const [todoEditTarget, setTodoEditTarget] = useState<TodoCardData | null>(null);

  const openTodoCreate = () => {
    setTodoEditTarget(null);
    setAddTodoOpen(true);
  };

  const openTodoEdit = (card: TodoCardData) => {
    setTodoEditTarget(card);
    setAddTodoOpen(true);
  };

  const createTaskList = useCreateTaskList();
  const updateTaskList = useUpdateTaskList();
  const deleteTaskList = useDeleteTaskList();

  const handleSubmitTodoModal = async () => {
    const input = document.querySelector<HTMLInputElement>('input[name="todo"]');
    const name = (input?.value ?? '').trim();
    if (!name) return;

    if (!activeGroupId) return;

    if (!todoEditTarget) {
      const created = await createTaskList.mutateAsync({ groupId: activeGroupId, name });
      // 생성 후 그 리스트로 선택
      setSelectedTaskListIdState(created.id);
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
  };

  /** ===== modals: task ===== */
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

  const createTask = useCreateTask();
  const patchTask = usePatchTask();
  const deleteTask = useDeleteTask();

  const invalidateCurrentList = async () => {
    await qc.invalidateQueries({
      queryKey: ['taskListByDate', activeGroupId, selectedTaskListId, selectedDateIso],
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
    const time = (payload.startTime ?? '09:00').split(':');
    const hh = Number(time[0] ?? 9);
    const mm = Number(time[1] ?? 0);
    start.setHours(Number.isFinite(hh) ? hh : 9, Number.isFinite(mm) ? mm : 0, 0, 0);

    if (!taskEditTarget) {
      await createTask.mutateAsync({
        groupId: activeGroupId,
        taskListId: selectedTaskListId,
        name: title,
        description: memo,
        startDate: start.toISOString(),
        frequencyType: freq,
      });
      await invalidateCurrentList();
      setCalendarModalOpen(false);
      setTaskEditTarget(null);
      return;
    }

    await patchTask.mutateAsync({
      groupId: activeGroupId,
      taskListId: selectedTaskListId,
      taskId: taskEditTarget.id,
      body: {
        name: title,
        description: memo,
        date: start.toISOString(),
      },
    });

    await invalidateCurrentList();
    setCalendarModalOpen(false);
    setTaskEditTarget(null);
  };

  /** ===== kebab close outside ===== */
  const [openedTaskMenuId, setOpenedTaskMenuId] = useState<number | null>(null);
  const [openedTodoMenuKey, setOpenedTodoMenuKey] = useState<string | null>(null);
  const [todoListDropdownOpen, setTodoListDropdownOpen] = useState(false);

  useEffect(() => {
    const onDoc = (ev: globalThis.MouseEvent) => {
      const t = ev.target as HTMLElement | null;
      if (!t) return;

      if (openedTaskMenuId !== null && !t.closest(`.${styles.taskMenu}`)) setOpenedTaskMenuId(null);
      if (openedTodoMenuKey !== null && !t.closest(`.${styles.kebabMenu}`))
        setOpenedTodoMenuKey(null);
      if (todoListDropdownOpen && !t.closest(`.${styles.todoListDropdown}`))
        setTodoListDropdownOpen(false);
    };

    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [openedTaskMenuId, openedTodoMenuKey, todoListDropdownOpen]);

  const handleSelectTodoList = (key: string) => {
    const id = Number(key.replace('taskList-', ''));
    if (!Number.isFinite(id) || id <= 0) return;
    setSelectedTaskListIdState(id);
    setTodoListDropdownOpen(false);
    setOpenedTodoMenuKey(null);
    // task 선택은 fallback 로직이 자동 처리
  };

  /** ===== detail overlay ===== */
  const [detailMounted, setDetailMounted] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const setSidebarCollapsedByClick = (collapsed: boolean) => {
    const root = desktopSidebarRef.current;
    if (!root) return;

    const closeBtn = root.querySelector<HTMLButtonElement>('button[aria-label="사이드바 닫기"]');
    const openBtn = root.querySelector<HTMLButtonElement>('button[aria-label="사이드바 열기"]');

    if (collapsed && closeBtn) closeBtn.click();
    if (!collapsed && openBtn) openBtn.click();
  };

  const openDetail = () => {
    if (isMobileUi) {
      setDetailMounted(true);
      setDetailOpen(true);
      return;
    }
    if (isPc) setSidebarCollapsedByClick(true);
    setDetailMounted(true);
    requestAnimationFrame(() => setDetailOpen(true));
  };

  const closeDetail = () => {
    if (isMobileUi) {
      setDetailOpen(false);
      setDetailMounted(false);
      return;
    }
    if (isPc) setSidebarCollapsedByClick(false);
    setDetailOpen(false);
    window.setTimeout(() => setDetailMounted(false), 260);
  };

  const handleOpenDetail = (taskId: number) => {
    if (detailMounted && detailOpen && taskId === selectedTaskId) {
      closeDetail();
      return;
    }
    setSelectedTaskIdState(taskId);
    openDetail();
  };

  /** ===== detail comments ===== */
  const { data: detailComments = [] } = useTaskComments(selectedTaskId);
  const createComment = useCreateTaskComment();

  const meWriter = useMemo(() => {
    return {
      id: me?.id ?? 0,
      nickname: me?.nickname ?? '',
      image: me?.image ? me.image : null,
    };
  }, [me]);

  /** ===== profile image (no <img>) ===== */
  const profile40 = useMemo(() => {
    const url = me?.image || '';
    return (
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: '#cbd5e1',
          backgroundImage: url ? `url(${url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }, [me?.image]);

  const profile32 = useMemo(() => {
    const url = me?.image || '';
    return (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 12,
          backgroundColor: '#cbd5e1',
          backgroundImage: url ? `url(${url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }, [me?.image]);

  /** ===== handlers ===== */
  const handleSelectGroup = (groupId: number) => {
    setActiveGroupIdState(groupId);
    // 그룹 변경 시 selection state 초기화 (effect 없이)
    setSelectedTaskListIdState(undefined);
    setSelectedTaskIdState(undefined);
    setOpenedTaskMenuId(null);
    setOpenedTodoMenuKey(null);
    closeDrawer();
  };

  const handleToggleDone = async (taskId: number, nextDone: boolean) => {
    if (!activeGroupId || !selectedTaskListId) return;

    await patchTask.mutateAsync({
      groupId: activeGroupId,
      taskListId: selectedTaskListId,
      taskId,
      body: {
        doneAt: nextDone ? new Date().toISOString() : null,
      },
    });

    await invalidateCurrentList();
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!activeGroupId || !selectedTaskListId) return;

    await deleteTask.mutateAsync({
      groupId: activeGroupId,
      taskListId: selectedTaskListId,
      taskId,
    });

    await invalidateCurrentList();

    if (detailMounted && selectedTaskId === taskId) closeDetail();
  };

  return (
    <main className={styles.page}>
      {isPc ? (
        <div ref={desktopSidebarRef} className={styles.desktopSidebar}>
          <Sidebar
            isLoggedIn
            profileName={me?.nickname ?? ''}
            profileTeam={activeGroup?.name ?? ''}
            profileImage={profile40}
          >
            {(isCollapsed) => (
              <>
                {groups.map((g) => (
                  <SidebarButton
                    key={g.id}
                    icon={<Image src={chessSmall} alt="" width={20} height={20} />}
                    label={g.name}
                    iconOnly={isCollapsed}
                    isActive={g.id === activeGroupId}
                    onClick={() => handleSelectGroup(g.id)}
                  />
                ))}

                {!isCollapsed ? (
                  <SidebarAddButton
                    label="팀 추가하기"
                    onClick={() => {
                      /* 라우팅 필요하면 여기 */
                    }}
                  />
                ) : null}

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

                <SidebarButton
                  icon={<Image src={boardSmall} alt="" width={20} height={20} />}
                  label="자유게시판"
                  iconOnly={isCollapsed}
                  onClick={() => {}}
                />
              </>
            )}
          </Sidebar>
        </div>
      ) : null}

      {isMobileUi ? (
        <div className={styles.mobileGnb}>
          <MobileHeader
            isLoggedIn
            profileImage={profile32}
            onMenuClick={toggleDrawer}
            onProfileClick={() => {}}
          />
        </div>
      ) : null}

      {isMobileUi ? (
        <MobileDrawer isOpen={drawerOpen} onClose={closeDrawer}>
          <>
            {groups.map((g) => (
              <SidebarButton
                key={g.id}
                icon={<Image src={chessSmall} alt="" width={20} height={20} />}
                label={g.name}
                isActive={g.id === activeGroupId}
                onClick={() => handleSelectGroup(g.id)}
              />
            ))}

            <SidebarAddButton label="팀 추가하기" onClick={closeDrawer} />

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

            <SidebarButton
              icon={<Image src={boardSmall} alt="" width={20} height={20} />}
              label="자유게시판"
              onClick={closeDrawer}
            />
          </>
        </MobileDrawer>
      ) : null}

      <section className={styles.mainContents}>
        <div className={styles.stage}>
          <div className={styles.teamHeaderPad}>
            <TeamHeader variant="list" teamName={activeGroup?.name ?? ''} settingsHref="" />
          </div>

          {/* Mobile Todo dropdown */}
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
                    }}
                  >
                    <Image src={downArrowSmall} alt="" width={16} height={16} />
                  </button>

                  <div className={styles.todoCardShell}>
                    <div
                      className={`${styles.todoCardShellInner} ${styles.todoCardShellCollapsed}`}
                    >
                      {selectedTodo ? (
                        <TodoCard
                          title={selectedTodo.title}
                          items={selectedTodo.items}
                          expanded={false}
                          onKebabClick={() => {}}
                          onItemCheckedChange={() => {}}
                        />
                      ) : null}
                    </div>
                  </div>

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
                          onClick={() => handleSelectTodoList(c.key)}
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
            {/* LEFT (PC) */}
            <section className={styles.leftCol} aria-label="할 일 목록(PC)">
              <h3 className={styles.leftTitle}>할 일</h3>

              <div className={styles.todoList}>
                {todoCardsWithPreview.map((card) => (
                  <div key={card.key} className={styles.todoCardWrap}>
                    <div
                      className={styles.todoCardShell}
                      onClick={() => handleSelectTodoList(card.key)}
                    >
                      <div className={styles.todoCardShellInner}>
                        <TodoCard
                          title={card.title}
                          items={card.items}
                          expanded={card.expanded}
                          onKebabClick={() =>
                            setOpenedTodoMenuKey((prev) => (prev === card.key ? null : card.key))
                          }
                          onItemCheckedChange={() => {}}
                        />
                      </div>
                    </div>

                    {openedTodoMenuKey === card.key ? (
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

                            // 삭제한 리스트가 선택중이면 selection reset
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

            {/* RIGHT */}
            <section className={styles.rightWrap} aria-label="선택된 목록의 할 일">
              <div className={styles.rightPanel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>
                    {selectedTodo?.title ?? '할 일을 입력해주세요..'}
                  </h2>

                  <div className={styles.panelControls}>
                    <span className={styles.yearMonth}>{formatYearMonth(viewDate)}</span>

                    <div className={styles.arrowGroup}>
                      <ArrowButton
                        size="small"
                        direction="left"
                        onClick={() => setViewDate((d) => addMonths(d, -1))}
                      />
                      <ArrowButton
                        size="small"
                        direction="right"
                        onClick={() => setViewDate((d) => addMonths(d, 1))}
                      />
                    </div>

                    <button type="button" className={styles.calendarBtn} aria-label="달력">
                      <Image src={calendarIcon} alt="" width={16} height={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.weekBar}>
                  <WeekDateBar
                    viewDate={viewDate}
                    value={selectedDate}
                    onChange={setSelectedDate}
                  />
                </div>

                <div className={styles.taskList}>
                  {tasks.length === 0 ? (
                    <div className={styles.emptyTasks}>선택한 날짜에 할 일이 없습니다.</div>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className={styles.taskRowClick}
                        onClick={(e: MouseEvent) => {
                          const t = e.target as HTMLElement | null;
                          if (isOpenDetailBlockedTarget(t)) return;
                          handleOpenDetail(task.id);
                        }}
                      >
                        <div style={{ position: 'relative' }}>
                          <TaskListItem
                            title={task.name}
                            date={selectedDateKey}
                            checked={!!task.doneAt}
                            isSelected={task.id === selectedTaskId}
                            commentCount={task.commentCount}
                            frequency={frequencyLabel(task.frequency)}
                            onCheckedChange={async (checked) => {
                              await handleToggleDone(task.id, checked);
                            }}
                            onKebabClick={() =>
                              setOpenedTaskMenuId((prev) => (prev === task.id ? null : task.id))
                            }
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
                                    await handleDeleteTask(task.id);
                                  }}
                                >
                                  삭제하기
                                </button>
                              </li>
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={styles.fab}>
                <FloatingButton icon="plus" onClick={openTaskCreate} />
              </div>
            </section>
          </div>
        </div>

        {/* ✅ Detail Overlay */}
        {detailMounted && selectedTask ? (
          <div
            className={`${styles.detailOverlay} ${detailOpen ? styles.detailOpen : styles.detailClose}`}
            role="dialog"
            aria-modal="true"
            onClick={closeDetail}
          >
            <div className={styles.detailInner} onClick={(e) => e.stopPropagation()}>
              <TaskDetailCard
                id={selectedTask.id}
                name={selectedTask.name}
                description={selectedTask.description ?? ''}
                date={selectedTask.date}
                frequency={selectedTask.frequency}
                writer={{
                  id: selectedTask.writer?.id ?? meWriter.id,
                  nickname: selectedTask.writer?.nickname ?? meWriter.nickname,
                  image: selectedTask.writer?.image ?? meWriter.image,
                }}
                doneAt={selectedTask.doneAt}
                comments={detailComments}
                onComplete={async () => {
                  await handleToggleDone(selectedTask.id, !selectedTask.doneAt);
                }}
                onEdit={() => openTaskEdit(selectedTask)}
                onDelete={async () => {
                  await handleDeleteTask(selectedTask.id);
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
          }}
          onSubmit={handleSubmitTodoModal}
          text={{
            title: '할 일 목록',
            submitLabel: todoEditTarget ? '수정하기' : '만들기',
            inputPlaceholder: '할 일을 입력하세요',
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
          initialValues={
            taskEditTarget
              ? {
                  todoTitle: taskEditTarget.name ?? '',
                  memo: taskEditTarget.description ?? '',
                  startDate: selectedDate,
                  startTime: '09:00',
                  repeatType: 'none',
                  repeatDays: [],
                }
              : {
                  startDate: selectedDate,
                  startTime: '09:00',
                  repeatType: 'none',
                  repeatDays: [],
                }
          }
          closeOptions={{ overlayClick: true, escape: true }}
        />
      </section>
    </main>
  );
}
