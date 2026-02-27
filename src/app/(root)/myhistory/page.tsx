'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import styles from './page.module.css';
import TeamHeader from '@/components/team-header';
import ArrowButton from '@/components/Button/domain/ArrowButton/ArrowButton';
import TaskCard from '@/components/Card/TaskCard/TaskCard';
import TaskListItem from '@/components/list/TaskListItem';
import TaskDetailCard from '@/components/Card/TaskDetailCard/TaskDetailCard';
import Chip from '@/components/Chip/Chip';
import Calendar from '@/components/calendar/Calendar';
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
  deleteTeam,
} from './queries';

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

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function ymFromDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}
function parseYm(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return { y, m };
}
function addMonths(ym: string, delta: number) {
  const { y, m } = parseYm(ym);
  const d = new Date(y, m - 1, 1, 0, 0, 0, 0);
  d.setMonth(d.getMonth() + delta);
  return ymFromDate(d);
}
function formatYearMonthFromKey(ym: string) {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월`;
}
function formatKoreanDateFromIso(isoLike: string) {
  const d = new Date(isoLike);
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
  const { y, m } = parseYm(ym);
  const from = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const to = new Date(y, m, 1, 0, 0, 0, 0);
  return { fromIso: from.toISOString(), toIso: to.toISOString() };
}
function dayKeyFromIso(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function monthKeyFromIso(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/** 체크박스/케밥/버튼 클릭이면 디테일 오픈 금지 */
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

export default function MyHistory() {
  const qc = useQueryClient();
  const router = useRouter();
  const params = useParams<{ teamid?: string }>();
  const teamId = params?.teamid ?? '';

  // ===== API =====
  const { data: me } = useMe();
  useEffect(() => {
    if (me) {
      qc.setQueryData(['currentUser'], me);
    }
  }, [me, qc]);

  const groups = useMemo(() => {
    const arr = (me?.memberships ?? []).map((m) => m.group);
    return arr.filter((g, idx) => arr.findIndex((x) => x.id === g.id) === idx);
  }, [me?.memberships]);

  const activeGroupId = groups[0]?.id ?? 0;
  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  const { data: groupDetail } = useGroupDetail(activeGroupId);
  const taskLists = useMemo(() => {
    return (groupDetail?.taskLists ?? []).slice().sort((a, b) => a.displayIndex - b.displayIndex);
  }, [groupDetail?.taskLists]);

  // ===== month =====
  const [userSelectedMonth, setUserSelectedMonth] = useState<string | null>(null);
  const defaultMonth = useMemo(() => ymFromDate(new Date()), []);
  const selectedMonth = userSelectedMonth ?? defaultMonth;

  const { fromIso: selectedFromIso, toIso: selectedToIso } = useMemo(
    () => monthRangeIso(selectedMonth),
    [selectedMonth],
  );

  //  선택월 다음달 시작까지(=선택월 포함) 받아오기
  const earliestFromIso = '2000-01-01T00:00:00.000Z';
  const nextMonth = useMemo(() => addMonths(selectedMonth, 1), [selectedMonth]);
  const { fromIso: toIso } = useMemo(() => monthRangeIso(nextMonth), [nextMonth]);

  // ===== done tasks =====
  const taskListIds = useMemo(() => taskLists.map((t) => t.id), [taskLists]);

  const { tasksDoneAll, isLoading: isDoneLoading } = useDoneTasksForTaskLists({
    groupId: activeGroupId,
    taskListIds,
    fromIso: earliestFromIso,
    toIso,
  });

  // ===== 선택 월만 추리기 =====
  const selectedFromT = useMemo(() => new Date(selectedFromIso).getTime(), [selectedFromIso]);
  const selectedToT = useMemo(() => new Date(selectedToIso).getTime(), [selectedToIso]);

  const tasksDoneSelectedMonth = useMemo(() => {
    return tasksDoneAll.filter((t: DoneTask) => {
      const iso = t.doneAt ?? t.date ?? '';
      if (!iso) return false;
      const time = new Date(iso).getTime();
      return time >= selectedFromT && time < selectedToT;
    });
  }, [tasksDoneAll, selectedFromT, selectedToT]);

  // ===== category selection =====
  const [selectedTaskListId, setSelectedTaskListId] = useState<number | null>(null);

  const categoriesInSelectedMonth = useMemo(() => {
    const map = new Map<number, number>();
    tasksDoneSelectedMonth.forEach((t: DoneTask) => {
      const id = (t.taskListId ?? 0) as number;
      if (!id) return;
      map.set(id, (map.get(id) ?? 0) + 1);
    });

    return taskLists.map((tl) => ({
      id: tl.id,
      label: tl.name,
      count: map.get(tl.id) ?? 0,
    }));
  }, [taskLists, tasksDoneSelectedMonth]);

  const firstNonZeroTaskListId = useMemo(() => {
    return categoriesInSelectedMonth.find((c) => c.count > 0)?.id ?? null;
  }, [categoriesInSelectedMonth]);

  const fallbackFirstTaskListId = useMemo(() => taskLists[0]?.id ?? null, [taskLists]);

  const effectiveTaskListId = useMemo(() => {
    if (selectedTaskListId != null && taskLists.some((t) => t.id === selectedTaskListId)) {
      return selectedTaskListId;
    }
    return firstNonZeroTaskListId ?? fallbackFirstTaskListId;
  }, [selectedTaskListId, taskLists, firstNonZeroTaskListId, fallbackFirstTaskListId]);

  const filteredTasks = useMemo<DoneTask[]>(() => {
    if (!effectiveTaskListId) return [];
    return tasksDoneSelectedMonth.filter(
      (t: DoneTask) => (t.taskListId ?? 0) === effectiveTaskListId,
    );
  }, [tasksDoneSelectedMonth, effectiveTaskListId]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, DoneTask[]>();

    filteredTasks.forEach((t: DoneTask) => {
      const iso = t.doneAt ?? t.date ?? '';
      const dayKey = iso ? dayKeyFromIso(iso) : '1970-01-01';
      const arr = map.get(dayKey) ?? [];
      arr.push(t);
      map.set(dayKey, arr);
    });

    const keys = Array.from(map.keys()).sort((a, b) => (a > b ? -1 : 1));

    return keys.map((k) => {
      const list = (map.get(k) ?? []).slice().sort((a, b) => {
        const ai = a.doneAt ?? a.date ?? '';
        const bi = b.doneAt ?? b.date ?? '';
        return ai > bi ? -1 : 1;
      });
      return { dayKey: k, tasks: list };
    });
  }, [filteredTasks]);

  // ✅ PC 왼쪽: “데이터 있는 달만” 표시 (선택월 이하만)
  const leftMonthBlocks = useMemo(() => {
    const monthMap = new Map<string, Map<number, number>>();

    tasksDoneAll.forEach((t) => {
      const iso = t.doneAt ?? t.date ?? '';
      const tlId = (t.taskListId ?? 0) as number;
      if (!iso || !tlId) return;

      const mk = monthKeyFromIso(iso);
      if (mk > selectedMonth) return;

      const inner = monthMap.get(mk) ?? new Map<number, number>();
      inner.set(tlId, (inner.get(tlId) ?? 0) + 1);
      monthMap.set(mk, inner);
    });

    const months = Array.from(monthMap.keys()).sort((a, b) => (a > b ? -1 : 1));

    return months
      .map((monthKey) => {
        const inner = monthMap.get(monthKey) ?? new Map<number, number>();
        const categories = taskLists.map((tl) => ({
          id: tl.id,
          label: tl.name,
          count: inner.get(tl.id) ?? 0,
        }));
        const total = categories.reduce((acc, c) => acc + c.count, 0);

        return {
          monthKey,
          monthLabel: formatYearMonthFromKey(monthKey),
          categories,
          total,
        };
      })
      .filter((b) => b.total > 0);
  }, [tasksDoneAll, taskLists, selectedMonth]);

  // ===== UI states =====
  const [openedTaskMenuId, setOpenedTaskMenuId] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);

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
    setOpenedTaskMenuId(null);
    if (detailMounted && detailOpen && taskId === effectiveSelectedTaskId) {
      closeDetail();
      return;
    }
    setSelectedTaskId(taskId);
    openDetail();
  };

  const invalidateCurrentRange = async () => {
    await qc.invalidateQueries({ queryKey: ['doneTasks'] });
  };

  async function apiToggleDone(task: DoneTask, done: boolean) {
    if (!activeGroupId || !task.taskListId) return;
    await patchTaskDone({
      groupId: activeGroupId,
      taskListId: task.taskListId,
      taskId: task.id,
      done,
    });
    await invalidateCurrentRange();
  }

  async function apiDelete(task: DoneTask) {
    if (!activeGroupId || !task.taskListId) return;
    await deleteTask({ groupId: activeGroupId, taskListId: task.taskListId, taskId: task.id });
    await invalidateCurrentRange();
  }

  const onPrevMonth = () => {
    const prev = addMonths(selectedMonth, -1);
    setUserSelectedMonth(prev);
    setOpenedTaskMenuId(null);
    setCalendarOpen(false);
    setTeamMenuOpen(false);
    closeDetailImmediate();
  };

  const onNextMonth = () => {
    const next = addMonths(selectedMonth, 1);
    setUserSelectedMonth(next);
    setOpenedTaskMenuId(null);
    setCalendarOpen(false);
    setTeamMenuOpen(false);
    closeDetailImmediate();
  };

  const monthLabel = formatYearMonthFromKey(selectedMonth);

  // TeamHeader settingsLink 클릭 / outside close
  const lastTeamMenuToggleAt = useRef<number>(0);

  useEffect(() => {
    const onDoc = (ev: globalThis.MouseEvent) => {
      const t = ev.target as HTMLElement | null;
      if (!t) return;

      const settingsLink = t.closest(
        '.TeamHeader-module__H3kcRq__settingsLink',
      ) as HTMLElement | null;
      if (settingsLink) {
        ev.preventDefault?.();
        ev.stopPropagation?.();
        lastTeamMenuToggleAt.current = Date.now();
        setTeamMenuOpen((p) => !p);
        return;
      }

      const aria = (t.closest('[aria-label]')?.getAttribute('aria-label') ?? '').toLowerCase();
      const isKebabClick = aria.includes('더보기') || aria.includes('kebab');
      if (!isKebabClick && openedTaskMenuId !== null && !t.closest(`.${styles.taskMenu}`)) {
        setOpenedTaskMenuId(null);
      }

      if (
        calendarOpen &&
        !t.closest(`.${styles.calendarPopover}`) &&
        !t.closest(`.${styles.calendarBtn}`)
      ) {
        setCalendarOpen(false);
      }

      if (teamMenuOpen) {
        const justToggled = Date.now() - lastTeamMenuToggleAt.current < 120;
        if (!justToggled && !t.closest(`.${styles.teamMenu}`)) {
          setTeamMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [openedTaskMenuId, calendarOpen, teamMenuOpen]);

  const goTeamEditPage = () => {
    setTeamMenuOpen(false);
    if (teamId) router.push(`/${teamId}/team`);
    else router.push(`/team`);
  };

  const doDeleteTeam = async () => {
    setTeamMenuOpen(false);
    const ok = window.confirm('팀을 삭제할까요? 삭제하면 되돌릴 수 없어요.');
    if (!ok) return;
    try {
      await deleteTeam();
      if (teamId) router.push(`/${teamId}`);
      else router.push(`/`);
    } catch {
      alert('삭제에 실패했어요. (권한/로그인 상태를 확인해주세요)');
    }
  };

  const preventAll = (e: ReactMouseEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <main className={styles.page}>
      <section className={styles.main}>
        <div className={styles.teamHeaderWrap}>
          <div className={styles.teamHeaderRow}>
            <TeamHeader variant="list" teamName={activeGroup?.name ?? ''} settingsHref="" />

            {teamMenuOpen ? (
              <div className={styles.teamMenu} role="menu" aria-label="팀 메뉴">
                <button type="button" className={styles.teamMenuItem} onClick={goTeamEditPage}>
                  수정하기
                </button>
                <button type="button" className={styles.teamMenuItemDanger} onClick={doDeleteTeam}>
                  삭제하기
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.body}>
          {/* LEFT (PC) */}
          <aside className={styles.leftCol} aria-label="내가 한 일 목록">
            <h2 className={styles.leftTitle}>내가 한 일</h2>

            <div className={styles.leftScroll}>
              {leftMonthBlocks.length === 0 ? (
                <div className={styles.leftEmpty}>완료한 작업이 없어요.</div>
              ) : (
                leftMonthBlocks.map((block) => (
                  <div key={block.monthKey} className={styles.monthBlock}>
                    <div className={styles.monthBlockTitle}>{block.monthLabel}</div>

                    <div className={styles.cardStack}>
                      {block.categories
                        .filter((c) => c.count > 0)
                        .map((c) => (
                          <TaskCard
                            key={`${block.monthKey}-${c.id}`}
                            label={c.label}
                            count={c.count}
                            onClick={() => {
                              setUserSelectedMonth(block.monthKey);
                              setSelectedTaskListId(c.id);
                              setOpenedTaskMenuId(null);
                              closeDetailImmediate();
                            }}
                          />
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

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

                {/* 모바일/태블릿 Chip row: 항상 렌더 (count=0도 표시) */}
                <div className={styles.chipRow} aria-label="카테고리 선택">
                  {categoriesInSelectedMonth.map((c) => (
                    <Chip
                      key={c.id}
                      label={c.label}
                      count={c.count}
                      size="small"
                      selected={effectiveTaskListId === c.id}
                      onClick={() => {
                        setSelectedTaskListId(c.id);
                        setOpenedTaskMenuId(null);
                        closeDetailImmediate();
                      }}
                    />
                  ))}
                </div>

                <div className={styles.boxBody}>
                  {isDoneLoading ? <div className={styles.emptyState}>불러오는 중…</div> : null}

                  {!isDoneLoading && filteredTasks.length === 0 ? (
                    <div className={styles.emptyState}>이 달에 완료된 작업이 없어요.</div>
                  ) : null}

                  {!isDoneLoading && filteredTasks.length > 0 ? (
                    <div className={styles.taskGroupWrap}>
                      {tasksByDate.map((group) => (
                        <section key={group.dayKey} className={styles.daySection}>
                          <div className={styles.dateDivider}>
                            <span className={styles.dateDividerLine} />
                            <span className={styles.dateDividerText}>
                              {formatKoreanDateFromIso(`${group.dayKey}T00:00:00`)}
                            </span>
                            <span className={styles.dateDividerLine} />
                          </div>

                          <div className={styles.taskList}>
                            {group.tasks.map((task) => (
                              <div
                                key={task.id}
                                className={styles.taskRow}
                                onClick={(e: ReactMouseEvent) => {
                                  const t = e.target as HTMLElement | null;
                                  if (isOpenDetailBlockedTarget(t)) return;
                                  handleOpenDetail(task.id);
                                }}
                              >
                                <div style={{ position: 'relative' }}>
                                  <TaskListItem
                                    title={task.name}
                                    date={formatKoreanDateFromIso(`${group.dayKey}T00:00:00`)}
                                    checked={!!task.doneAt}
                                    isSelected={false}
                                    commentCount={task.commentCount ?? 0}
                                    frequency={frequencyLabel(task.frequency ?? null)}
                                    onCheckedChange={undefined}
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
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <li>
                                        <button
                                          type="button"
                                          className={styles.taskMenuItem}
                                          onClick={(e) => {
                                            e.stopPropagation();
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
                                          className={`${styles.taskMenuItem} ${styles.taskMenuItemDisabled}`}
                                          disabled
                                          onClick={preventAll}
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
                onCommentSubmit={(content) => {
                  if (!effectiveSelectedTaskId) return;
                  createComment.mutate({ content });
                }}
              />
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
