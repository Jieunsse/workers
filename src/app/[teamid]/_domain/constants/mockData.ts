import type { TeamMember, KanbanTask, MockTeam } from '../interfaces/team';

export const MOCK_TEAM_NAME = '경영관리팀';

export const MOCK_TEAMS: MockTeam[] = [
  { id: '1', name: '경영관리팀' },
  { id: '2', name: '프로덕트팀' },
  { id: '3', name: '마케팅팀' },
  { id: '4', name: '콘텐츠팀' },
];

export const MOCK_MEMBERS: TeamMember[] = [
  { id: '1', name: '우지은', email: 'jieun@codeit.com' },
  { id: '2', name: '김민준', email: 'minjun@codeit.com' },
  { id: '3', name: '이서연', email: 'seoyeon@codeit.com' },
  { id: '4', name: '박도현', email: 'dohyeon@codeit.com' },
];

export const MOCK_TASKS: KanbanTask[] = [
  {
    id: 'task-1',
    title: '법인 설립',
    status: 'todo',
    items: [
      { id: 'item-1', text: '법인 설립 안내 드리기', checked: false },
      { id: 'item-2', text: '법인 설립 혹은 변경 등기 비용 안내 드리기', checked: false },
      { id: 'item-3', text: '입력해주신 정보를 바탕으로 등기신청서 제출하기', checked: true },
    ],
  },
  {
    id: 'task-2',
    title: '마케팅 전략 수립',
    status: 'todo',
    items: [
      { id: 'item-4', text: '시장 조사 보고서 작성', checked: false },
      { id: 'item-5', text: 'SNS 마케팅 계획 수립', checked: false },
    ],
  },
  {
    id: 'task-3',
    title: '제품 기획',
    status: 'inProgress',
    items: [
      { id: 'item-6', text: '사용자 인터뷰 진행', checked: true },
      { id: 'item-7', text: '기능 명세서 작성', checked: true },
      { id: 'item-8', text: '와이어프레임 작성', checked: false },
      { id: 'item-9', text: '프로토타입 제작', checked: false },
      { id: 'item-10', text: '사용성 테스트', checked: false },
    ],
  },
  {
    id: 'task-4',
    title: '회의록 정리',
    status: 'done',
    items: [
      { id: 'item-11', text: '주간 회의 내용 정리', checked: true },
      { id: 'item-12', text: '액션 아이템 배분', checked: true },
      { id: 'item-13', text: '팀원들에게 공유', checked: true },
      { id: 'item-14', text: '다음 회의 일정 잡기', checked: true },
      { id: 'item-15', text: '회의록 보관', checked: true },
    ],
  },
];

export const MOCK_TODAY_REPORT = {
  totalTasks: 20,
  doneTasks: 5,
};

export const MOCK_INVITE_LINK = 'https://coworkers.app/invite/abc123';
