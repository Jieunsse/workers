'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';

import styles from './history.module.css';

import Sidebar from '@/components/sidebar/Sidebar';
import MobileHeader from '@/components/sidebar/MobileHeader';
import MobileDrawer from '@/components/sidebar/MobileDrawer';

import SidebarButton from '@/components/sidebar/SidebarButton';
import SidebarAddButton from '@/components/sidebar/SidebarAddButton';

import TeamHeader from '@/components/team-header';
import ArrowButton from '@/components/Button/domain/ArrowButton/ArrowButton';

import TaskCard from '@/components/Card/TaskCard/TaskCard';
import Chip from '@/components/Chip/Chip';
import TaskListItem from '@/components/list/TaskListItem';
import TaskDetailCard from '@/components/Card/TaskDetailCard/TaskDetailCard';

import Calendar from '@/components/calendar/Calendar';

import chessSmall from '@/assets/icons/chess/chessSmall.svg';
import boardSmall from '@/assets/icons/board/boardSmall.svg';
import calendarIcon from '@/assets/icons/calender/calenderSmall.svg';

import {
  type ApiFrequency,
  type DoneTask,
  useCreateTaskComment,
  useDoneTasksForTaskLists,
  useGroupDetail,
  useMe,
  useTaskComments,
  patchTaskDone,
  deleteTask,
} from './hooks/queries';

// ===== no setState in effect: media query =====
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

type Writer = { id: number; nickname: string; image: string | null };
type UiComment = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: number;
  userId: number;
  user: Writer;
};

function ymFromDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function formatYearMonthFromKey(ym: string) {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월`;
}
function formatKoreanDateFromIso(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const week = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${yyyy}년 ${mm}월 ${dd}일 (${week})`;
}
function frequencyLabel(freq?: ApiFrequency | null) {
  if (freq === 'DAILY') return '매일 반복';
  if (freq === 'WEEKLY') return '매주 반복';
  if (freq === 'MONTHLY') return '매월 반복';
  return undefined;
}
function monthRangeIso(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  const from = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const to = new Date(y, m, 1, 0, 0, 0, 0); // next month start
  return { fromIso: from.toISOString(), toIso: to.toISOString() };
}

/** ✅ 체크박스/케밥/버튼 클릭이면 디테일 오픈 금지 */
function isOpenDetailBlockedTarget(target: HTMLElement | null) {
  if (!target) return false;

  if (target.closest('button, a, input, textarea, select, [role="button"]')) return true;
  if (target.closest('[role="checkbox"]')) return true;
  if (target.closest('[aria-checked]')) return true;

  const labeled = target.closest('[aria-label]') as HTMLElement | null;
  if (labeled) {
    const v = (labeled.getAttribute('aria-label') ?? '').toLowerCase();
    if (v.includes('체크') || v.includes('완료') || v.includes('더보기') || v.includes('kebab')) {
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

export default function HistoryPage() {
  const qc = useQueryClient();
  const desktopSidebarRef = useRef<HTMLDivElement | null>(null);

  const isPc = useMediaQuery('(min-width: 1025px)');
  const isMobileUi = useMediaQuery('(max-width: 1024px)');

  // mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen((p) => !p);
  const closeDrawer = () => setDrawerOpen(false);

  // ===== API =====
  const { data: me } = useMe();

  const groups = useMemo(() => {
    const arr = (me?.memberships ?? []).map((m) => m.group);
    return arr.filter((g, idx) => arr.findIndex((x) => x.id === g.id) === idx);
  }, [me?.memberships]);

  // ✅ 기본 group은 파생값, 유저 선택만 state
  const [userSelectedGroupId, setUserSelectedGroupId] = useState<number | null>(null);
  const defaultGroupId = useMemo(() => groups[0]?.id ?? 0, [groups]);
  const activeGroupId = userSelectedGroupId ?? defaultGroupId;

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  // group detail -> taskLists(=카테고리)
  const { data: groupDetail } = useGroupDetail(activeGroupId);
  const taskLists = useMemo(() => {
    return (groupDetail?.taskLists ?? []).slice().sort((a, b) => a.displayIndex - b.displayIndex);
  }, [groupDetail?.taskLists]);

  // ===== month =====
  const [userSelectedMonth, setUserSelectedMonth] = useState<string | null>(null);

  // 기본 월: "현재월"로 두고, 월에 데이터가 없으면 empty state 유지 (list처럼 강제 세팅 X)
  const defaultMonth = useMemo(() => ymFromDate(new Date()), []);
  const selectedMonth = userSelectedMonth ?? defaultMonth;

  const { fromIso, toIso } = useMemo(() => monthRangeIso(selectedMonth), [selectedMonth]);

  // ===== done tasks (모든 taskList를 한번에 모아오기) =====
  const taskListIds = useMemo(() => taskLists.map((t) => t.id), [taskLists]);
  const { tasksDoneAll } = useDoneTasksForTaskLists({
    groupId: activeGroupId,
    taskListIds,
    fromIso,
    toIso,
  });

  // ===== category selection (taskList) =====
  const [selectedTaskListId, setSelectedTaskListId] = useState<number | null>(null);

  // "기본 카테고리"는 파생값(첫 taskList), effect로 setState 하지 않음
  const effectiveTaskListId = selectedTaskListId ?? taskLists[0]?.id ?? null;

  const categoriesInMonth = useMemo(() => {
    // taskList별 완료개수
    const map = new Map<number, number>();
    tasksDoneAll.forEach((t) => {
      const id = (t.taskListId ?? 0) as number;
      if (!id) return;
      map.set(id, (map.get(id) ?? 0) + 1);
    });

    return taskLists.map((tl) => ({
      id: tl.id,
      label: tl.name,
      count: map.get(tl.id) ?? 0,
    }));
  }, [taskLists, tasksDoneAll]);

  const filteredTasks = useMemo(() => {
    if (!effectiveTaskListId) return [];
    return tasksDoneAll.filter((t) => (t.taskListId ?? 0) === effectiveTaskListId);
  }, [tasksDoneAll, effectiveTaskListId]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, DoneTask[]>();
    filteredTasks.forEach((t) => {
      const iso = t.doneAt ?? t.date ?? '';
      const dayKey = iso ? iso.slice(0, 10) : '1970-01-01';
      const arr = map.get(dayKey) ?? [];
      arr.push(t);
      map.set(dayKey, arr);
    });

    const keys = Array.from(map.keys()).sort((a, b) => (a > b ? 1 : -1));
    return keys.map((k) => ({ dayKey: k, tasks: map.get(k)! }));
  }, [filteredTasks]);

  // ===== UI states =====
  const [openedTaskMenuId, setOpenedTaskMenuId] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // detail overlay
  const [detailMounted, setDetailMounted] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<number>(0);

  const effectiveSelectedTaskId = useMemo(() => {
    if (filteredTasks.length === 0) return 0;
    if (filteredTasks.some((t) => t.id === selectedTaskId)) return selectedTaskId;
    return filteredTasks[0].id;
  }, [filteredTasks, selectedTaskId]);

  const selectedTask = useMemo(() => {
    if (!effectiveSelectedTaskId) return null;
    return filteredTasks.find((t) => t.id === effectiveSelectedTaskId) ?? null;
  }, [filteredTasks, effectiveSelectedTaskId]);

  // comments
  const { data: apiComments = [] } = useTaskComments(effectiveSelectedTaskId);
  const createComment = useCreateTaskComment(effectiveSelectedTaskId);

  const meWriter: Writer = useMemo(
    () => ({
      id: me?.id ?? 0,
      nickname: me?.nickname ?? '',
      image: me?.image ?? null,
    }),
    [me],
  );

  const detailComments: UiComment[] = useMemo(() => {
    return apiComments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      taskId: c.taskId ?? effectiveSelectedTaskId,
      userId: c.userId ?? c.user?.id ?? 0,
      user: {
        id: c.user?.id ?? 0,
        nickname: c.user?.nickname ?? '',
        image: c.user?.image ?? null,
      },
    }));
  }, [apiComments, effectiveSelectedTaskId]);

  function closeDetailImmediate() {
    setDetailOpen(false);
    setDetailMounted(false);
  }
  function openDetail() {
    setDetailMounted(true);
    requestAnimationFrame(() => setDetailOpen(true));
  }
  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setDetailMounted(false), 260);
  }

  const handleOpenDetail = (taskId: number) => {
    if (detailMounted && detailOpen && taskId === effectiveSelectedTaskId) {
      closeDetail();
      return;
    }
    setSelectedTaskId(taskId);
    openDetail();
  };

  const invalidateCurrentMonth = async () => {
    // 월 범위/카테고리 쿼리키 전부 무효화
    await qc.invalidateQueries({ queryKey: ['doneTasks', activeGroupId] });
  };

  async function apiToggleDone(task: DoneTask, done: boolean) {
    if (!activeGroupId || !task.taskListId) return;
    await patchTaskDone({
      groupId: activeGroupId,
      taskListId: task.taskListId,
      taskId: task.id,
      done,
    });
    await invalidateCurrentMonth();
  }

  async function apiDelete(task: DoneTask) {
    if (!activeGroupId || !task.taskListId) return;
    await deleteTask({ groupId: activeGroupId, taskListId: task.taskListId, taskId: task.id });
    await invalidateCurrentMonth();
  }

  // outside click close
  useEffect(() => {
    const onDoc = (ev: globalThis.MouseEvent) => {
      const t = ev.target as HTMLElement | null;
      if (!t) return;

      if (openedTaskMenuId !== null && !t.closest(`.${styles.taskMenu}`)) setOpenedTaskMenuId(null);

      if (
        calendarOpen &&
        !t.closest(`.${styles.calendarPopover}`) &&
        !t.closest(`.${styles.calendarBtn}`)
      ) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [openedTaskMenuId, calendarOpen]);

  // handlers
  const changeTeam = (groupId: number) => {
    setUserSelectedGroupId(groupId);

    // 팀 바뀌면 선택 리셋 (effect로 setState 금지)
    setSelectedTaskListId(null);
    setOpenedTaskMenuId(null);
    setCalendarOpen(false);
    closeDetailImmediate();
  };

  const onPrevMonth = () => {
    const base = new Date(`${selectedMonth}-01T00:00:00`);
    base.setMonth(base.getMonth() - 1);
    setUserSelectedMonth(ymFromDate(base));
    setOpenedTaskMenuId(null);
    setCalendarOpen(false);
    closeDetailImmediate();
  };

  const onNextMonth = () => {
    const base = new Date(`${selectedMonth}-01T00:00:00`);
    base.setMonth(base.getMonth() + 1);
    setUserSelectedMonth(ymFromDate(base));
    setOpenedTaskMenuId(null);
    setCalendarOpen(false);
    closeDetailImmediate();
  };

  const monthLabel = formatYearMonthFromKey(selectedMonth);
  const chipSize = isMobileUi ? 'small' : 'large';

  return (
    <main className={styles.page}>
      {/* PC Sidebar */}
      {isPc ? (
        <div ref={desktopSidebarRef} className={styles.desktopSidebar}>
          <Sidebar
            isLoggedIn
            profileName={me?.nickname ?? ''}
            profileTeam={activeGroup?.name ?? ''}
            profileImage={
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#cbd5e1' }} />
            }
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
                    onClick={() => changeTeam(g.id)}
                  />
                ))}

                {!isCollapsed ? <SidebarAddButton label="팀 추가하기" onClick={() => {}} /> : null}

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

      {/* Mobile */}
      {isMobileUi ? (
        <div className={styles.mobileGnb}>
          <MobileHeader
            isLoggedIn
            profileImage={
              <div style={{ width: 32, height: 32, borderRadius: 12, background: '#cbd5e1' }} />
            }
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
                onClick={() => {
                  changeTeam(g.id);
                  closeDrawer();
                }}
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

      {/* Main */}
      <section className={styles.main}>
        <div className={styles.teamHeaderWrap}>
          <TeamHeader variant="list" teamName={activeGroup?.name ?? ''} settingsHref="" />
        </div>

        <div className={styles.body}>
          {/* LEFT: PC만 - taskList를 카드로 */}
          {isPc ? (
            <aside className={styles.leftCol} aria-label="할 일 목록(PC)">
              <h2 className={styles.leftTitle}>할 일 목록</h2>

              <div className={styles.leftScroll}>
                {taskLists.map((tl) => {
                  const count = categoriesInMonth.find((c) => c.id === tl.id)?.count ?? 0;
                  return (
                    <section key={tl.id} className={styles.monthSection} aria-label={tl.name}>
                      <div
                        className={styles.monthTitle}
                        role="button"
                        onClick={() => setSelectedTaskListId(tl.id)}
                      >
                        {tl.name}
                      </div>

                      <div className={styles.cardStack}>
                        <TaskCard
                          label="완료"
                          count={count}
                          onClick={() => setSelectedTaskListId(tl.id)}
                        />
                      </div>
                    </section>
                  );
                })}
              </div>
            </aside>
          ) : null}

          {/* RIGHT */}
          <section className={styles.rightCol} aria-label="히스토리">
            <div className={styles.whiteBox}>
              <div className={styles.rightPanel}>
                <div className={styles.boxHeader}>
                  <div className={styles.boxHeaderLeft}>
                    <ArrowButton size="small" direction="left" onClick={onPrevMonth} />
                    <span className={styles.monthLabel}>{monthLabel}</span>
                    <ArrowButton size="small" direction="right" onClick={onNextMonth} />
                  </div>

                  <button
                    type="button"
                    className={styles.calendarBtn}
                    aria-label="달력"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalendarOpen((p) => !p);
                    }}
                  >
                    <Image src={calendarIcon} alt="" width={16} height={16} />
                  </button>

                  {calendarOpen ? (
                    <div
                      className={styles.calendarPopover}
                      onClick={(e) => e.stopPropagation()}
                      role="dialog"
                      aria-label="캘린더"
                    >
                      <Calendar
                        value={new Date(`${selectedMonth}-01T00:00:00`)}
                        onChange={(d) => {
                          if (!d) return;
                          setUserSelectedMonth(ymFromDate(d));
                          setCalendarOpen(false);
                          setOpenedTaskMenuId(null);
                          closeDetailImmediate();
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                {/* Mobile: taskList를 Chip으로 */}
                {!isPc ? (
                  <div className={styles.chipRow} aria-label="할 일 목록 칩">
                    {categoriesInMonth.map((c) => (
                      <Chip
                        key={c.id}
                        label={c.label}
                        count={c.count}
                        size={chipSize as 'large' | 'small'}
                        selected={c.id === effectiveTaskListId}
                        onClick={() => setSelectedTaskListId(c.id)}
                      />
                    ))}
                  </div>
                ) : null}

                <div className={styles.boxBody}>
                  {filteredTasks.length === 0 ? (
                    <div className={styles.emptyState}>
                      아직 완료된 작업이 없어요.
                      <br />
                      하나씩 완료해가며 히스토리를 만들어보세요!
                    </div>
                  ) : null}

                  {filteredTasks.length > 0 ? (
                    <div className={styles.taskGroupWrap}>
                      {tasksByDate.map((group) => (
                        <section key={group.dayKey} className={styles.daySection}>
                          <div className={styles.dateDivider}>
                            <span className={styles.dateDividerLine} />
                            <span className={styles.dateDividerText}>
                              {formatKoreanDateFromIso(`${group.dayKey}T00:00:00.000Z`)}
                            </span>
                            <span className={styles.dateDividerLine} />
                          </div>

                          <div className={styles.taskList}>
                            {group.tasks.map((task) => (
                              <div
                                key={task.id}
                                className={styles.taskRow}
                                onClick={(e: MouseEvent) => {
                                  const t = e.target as HTMLElement | null;
                                  if (isOpenDetailBlockedTarget(t)) return;
                                  handleOpenDetail(task.id);
                                }}
                              >
                                <div style={{ position: 'relative' }}>
                                  <TaskListItem
                                    title={task.name}
                                    date={formatKoreanDateFromIso(`${group.dayKey}T00:00:00.000Z`)}
                                    checked={!!task.doneAt}
                                    isSelected={false}
                                    commentCount={task.commentCount ?? 0}
                                    frequency={frequencyLabel(task.frequency ?? null)}
                                    onCheckedChange={async (checked) => {
                                      await apiToggleDone(task, checked);
                                    }}
                                    onKebabClick={() =>
                                      setOpenedTaskMenuId((prev) =>
                                        prev === task.id ? null : task.id,
                                      )
                                    }
                                  />

                                  {openedTaskMenuId === task.id ? (
                                    <ul
                                      className={styles.taskMenu}
                                      role="menu"
                                      aria-label="할 일 메뉴"
                                    >
                                      <li>
                                        <button
                                          type="button"
                                          className={styles.taskMenuItem}
                                          onClick={() => {
                                            setOpenedTaskMenuId(null);
                                            handleOpenDetail(task.id);
                                          }}
                                        >
                                          상세보기
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          type="button"
                                          className={styles.taskMenuItem}
                                          onClick={async () => {
                                            setOpenedTaskMenuId(null);
                                            await apiDelete(task);
                                          }}
                                        >
                                          삭제하기
                                        </button>
                                      </li>
                                    </ul>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Detail Overlay */}
        {detailMounted && selectedTask ? (
          <div
            className={`${styles.detailOverlay} ${detailOpen ? styles.detailOpen : styles.detailClose}`}
            role="dialog"
            aria-modal="true"
            onClick={closeDetail}
          >
            <div className={styles.detailInner} onClick={(e) => e.stopPropagation()}>
              <TaskDetailCard
                id={Number(selectedTask.id)}
                name={selectedTask.name}
                description={selectedTask.description ?? ''}
                date={
                  (selectedTask.doneAt ?? selectedTask.date ?? new Date().toISOString()) as string
                }
                frequency={(selectedTask.frequency ?? 'ONCE') as ApiFrequency}
                writer={{
                  id: selectedTask.writer?.id ?? meWriter.id,
                  nickname: selectedTask.writer?.nickname ?? meWriter.nickname,
                  image: selectedTask.writer?.image ?? meWriter.image,
                }}
                doneAt={selectedTask.doneAt ?? null}
                comments={detailComments}
                onComplete={async () => {
                  await apiToggleDone(selectedTask, !selectedTask.doneAt);
                }}
                onEdit={() => {}}
                onDelete={async () => {
                  await apiDelete(selectedTask);
                  closeDetail();
                }}
                onClose={closeDetail}
                onCommentSubmit={(content) => createComment.mutate({ content })}
              />
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
