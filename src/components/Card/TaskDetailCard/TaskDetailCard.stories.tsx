import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import TaskDetailCard from './TaskDetailCard';

const meta = {
  title: 'Components/Card/TaskDetailCard',
  component: TaskDetailCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
TaskDetailCard는 할 일 상세 정보를 표시하는 카드 컴포넌트입니다.

- 할 일 제목, 담당자, 시작 날짜, 반복 설정, 본문 내용을 표시합니다.
- 완료하기/완료 취소하기 버튼으로 할 일 상태를 변경할 수 있습니다.
- KebabMenu를 통해 수정/삭제 액션을 제공합니다.
- 댓글 목록과 댓글 입력 기능을 포함합니다.
- API 응답 구조(Task, Comment)와 일치하는 Props를 받습니다.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: 'number',
      description: '할 일 ID',
    },
    name: {
      control: 'text',
      description: '할 일 제목',
    },
    description: {
      control: 'text',
      description: '할 일 상세 내용',
    },
    date: {
      control: 'text',
      description: '시작 날짜 (ISO 8601 형식)',
    },
    frequency: {
      control: 'select',
      options: ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'],
      description: '반복 설정',
    },
    writer: {
      control: 'object',
      description: '작성자 정보',
    },
    doneAt: {
      control: 'text',
      description: '완료 시각 (null이면 미완료)',
    },
    comments: {
      control: 'object',
      description: '댓글 목록',
    },
    onComplete: {
      action: 'complete',
      description: '완료하기 버튼 클릭',
    },
    onEdit: {
      action: 'edit',
      description: '수정하기 클릭',
    },
    onDelete: {
      action: 'delete',
      description: '삭제하기 클릭',
    },
    onClose: {
      action: 'close',
      description: '닫기 버튼 클릭',
    },
    onCommentSubmit: {
      action: 'comment-submit',
      description: '댓글 작성',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '780px', maxWidth: '100vw' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskDetailCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock 데이터
const mockWriter = {
  id: 1,
  nickname: '안해나',
  image: null,
};

const mockComments = [
  {
    id: 1,
    content: '법인 설립 서류는 관련 법률 정문 드리겠습니다. https://www.codeit.kr',
    createdAt: '2024-07-29T15:30:00Z',
    updatedAt: '2024-07-29T15:30:00Z',
    taskId: 1,
    userId: 1,
    user: {
      id: 1,
      nickname: '안해나',
      image: null,
    },
  },
  {
    id: 2,
    content: '혹시 관련해서 미팅 오늘 중으로 가능하신가요?',
    createdAt: '2024-07-25T10:00:00Z',
    updatedAt: '2024-07-25T10:00:00Z',
    taskId: 1,
    userId: 2,
    user: {
      id: 2,
      nickname: '김대해',
      image: null,
    },
  },
  {
    id: 3,
    content: '법인 설립 비용 관련해서 예상 레퍼런스도 제공해달라고 들었는데 제공받은 걸 같이요?',
    createdAt: '2024-07-25T09:30:00Z',
    updatedAt: '2024-07-25T09:30:00Z',
    taskId: 1,
    userId: 3,
    user: {
      id: 3,
      nickname: '이연지',
      image: null,
    },
  },
];

// 기본 (미완료)
export const Default: Story = {
  args: {
    id: 1,
    name: '법인 설립 비용 안내 드리기',
    description:
      '필수 정보 10분 입력하면 3일 안에 법인 설립이 완료되는 법인 설립 서비스의 장점에 대해 상세하게 설명드리기',
    date: '2024-07-29T15:30:00Z',
    frequency: 'DAILY',
    writer: mockWriter,
    doneAt: null,
    comments: mockComments,
    onComplete: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onClose: fn(),
    onCommentSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '미완료 상태의 할 일 카드입니다. 완료하기 버튼이 표시됩니다.',
      },
    },
  },
};

// 완료 상태
export const Completed: Story = {
  args: {
    id: 1,
    name: '법인 설립 비용 안내 드리기',
    description:
      '필수 정보 10분 입력하면 3일 안에 법인 설립이 완료되는 법인 설립 서비스의 장점에 대해 상세하게 설명드리기',
    date: '2024-07-29T15:30:00Z',
    frequency: 'DAILY',
    writer: mockWriter,
    doneAt: '2024-07-30T10:00:00Z',
    comments: mockComments,
    onComplete: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onClose: fn(),
    onCommentSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '완료된 할 일 카드입니다. 완료 취소하기 버튼이 표시됩니다.',
      },
    },
  },
};

// 한번 반복
export const FrequencyOnce: Story = {
  args: {
    id: 2,
    name: '커피 머신 고장 신고하기',
    description: '1층 커피 머신에서 물이 샙니다.',
    date: '2024-07-29T09:00:00Z',
    frequency: 'ONCE',
    writer: mockWriter,
    doneAt: null,
    comments: [],
    onComplete: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onClose: fn(),
    onCommentSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '한번만 실행되는 할 일입니다.',
      },
    },
  },
};

// 주 반복
export const FrequencyWeekly: Story = {
  args: {
    id: 3,
    name: '주간 회의 준비',
    description: '매주 월요일 회의 자료 준비',
    date: '2024-11-14T10:00:00Z',
    frequency: 'WEEKLY',
    writer: mockWriter,
    doneAt: null,
    comments: [],
    onComplete: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onClose: fn(),
    onCommentSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '주 단위로 반복되는 할 일입니다.',
      },
    },
  },
};

// 월 반복
export const FrequencyMonthly: Story = {
  args: {
    id: 4,
    name: '월간 보고서 작성',
    description: '매월 말일 제출',
    date: '2024-11-14T10:00:00Z',
    frequency: 'MONTHLY',
    writer: mockWriter,
    doneAt: null,
    comments: [],
    onComplete: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onClose: fn(),
    onCommentSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '월 단위로 반복되는 할 일입니다.',
      },
    },
  },
};

// 댓글 없음
export const NoComments: Story = {
  args: {
    id: 5,
    name: '새로운 할 일',
    description: '아직 댓글이 없습니다.',
    date: '2024-07-29T15:30:00Z',
    frequency: 'ONCE',
    writer: mockWriter,
    doneAt: null,
    comments: [],
    onComplete: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onClose: fn(),
    onCommentSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '댓글이 없는 할 일 카드입니다.',
      },
    },
  },
};

// 긴 내용
export const LongContent: Story = {
  args: {
    id: 6,
    name: '매우 긴 제목을 가진 할 일입니다. 이렇게 긴 제목도 잘 표시되는지 확인이 필요합니다.',
    description: `이것은 매우 긴 설명입니다.
    
여러 줄에 걸쳐 작성된 내용도 제대로 표시되는지 확인해야 합니다.

1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목

이렇게 긴 텍스트가 어떻게 보이는지 확인하는 것이 중요합니다.`,
    date: '2024-07-29T15:30:00Z',
    frequency: 'DAILY',
    writer: mockWriter,
    doneAt: null,
    comments: mockComments,
    onComplete: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onClose: fn(),
    onCommentSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '긴 제목과 본문 내용을 가진 할 일 카드입니다.',
      },
    },
  },
};

// 모든 반복 타입 비교
export const AllFrequencies: Story = {
  args: {
    id: 1,
    name: '반복 타입 비교',
    description: '반복 설정 비교용',
    date: '2024-07-29T15:30:00Z',
    frequency: 'ONCE',
    writer: mockWriter,
    doneAt: null,
    comments: [],
    onComplete: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onClose: fn(),
    onCommentSubmit: fn(),
  },
  render: () => {
    const frequencies: Array<'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'> = [
      'ONCE',
      'DAILY',
      'WEEKLY',
      'MONTHLY',
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {frequencies.map((freq) => (
          <TaskDetailCard
            key={freq}
            id={1}
            name={`${freq} 반복 할 일`}
            description="반복 설정에 따른 표시 확인"
            date="2024-07-29T15:30:00Z"
            frequency={freq}
            writer={mockWriter}
            doneAt={null}
            comments={[]}
            onComplete={fn()}
            onEdit={fn()}
            onDelete={fn()}
            onClose={fn()}
            onCommentSubmit={fn()}
          />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '모든 반복 설정 타입을 비교할 수 있습니다.',
      },
    },
  },
};
