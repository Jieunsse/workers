export type KanbanStatus = 'todo' | 'inProgress' | 'done';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface TaskItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface KanbanTask {
  id: string;
  title: string;
  items: TaskItem[];
  status: KanbanStatus;
}

export interface MockTeam {
  id: string;
  name: string;
}
