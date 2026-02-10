import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import TaskCard from './TaskCard';

const meta = {
  title: 'Components/Card/TaskCard',
  component: TaskCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
TaskCard는 PC 환경에서 할 일 목록을 카드 형태로 표시하는 컴포넌트입니다.

- 할 일 이름(label)과 개수(count)를 표시합니다.
- 모바일/태블릿에서는 동일한 데이터를 Chip 컴포넌트로 표현합니다.
- hover 시 미묘한 scale 효과가 적용됩니다.
- 높이는 54px로 고정되며, 너비는 부모 컨테이너를 따릅니다.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '할 일 이름',
    },
    count: {
      control: 'number',
      description: '할 일 개수',
    },
    onClick: {
      action: 'clicked',
      description: '클릭 이벤트 핸들러',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '270px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본
export const Default: Story = {
  args: {
    label: '법인 설립',
    count: 12,
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '기본 TaskCard입니다.',
      },
    },
  },
};

// 다양한 개수
export const SmallCount: Story = {
  args: {
    label: '변경 등기',
    count: 2,
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '작은 개수(2개)의 TaskCard입니다.',
      },
    },
  },
};

export const LargeCount: Story = {
  args: {
    label: '법인 폐업',
    count: 158,
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '큰 개수(158개)의 TaskCard입니다.',
      },
    },
  },
};

// 긴 텍스트
export const LongText: Story = {
  args: {
    label: '매우 긴 할 일 이름입니다 이렇게 길어도 잘 표시될까요',
    count: 5,
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '긴 텍스트를 가진 TaskCard입니다.',
      },
    },
  },
};

// 여러 개 나열
export const Multiple: Story = {
  args: {
    label: '법인 설립',
    count: 3,
  },
  render: () => {
    const tasks = [
      { label: '법인 설립', count: 3 },
      { label: '변경 등기', count: 2 },
      { label: '법인 폐업', count: 5 },
      { label: '상표 등록', count: 1 },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '270px' }}>
        {tasks.map((task, index) => (
          <TaskCard key={index} label={task.label} count={task.count} onClick={fn()} />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '여러 개의 TaskCard를 나열한 예시입니다. (내가 한 일 페이지)',
      },
    },
  },
};

// 너비 비교
// ✅ 수정
export const WidthComparison: Story = {
  args: {
    label: '법인 설립',
    count: 12,
  },
  render: () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ marginBottom: '8px', color: '#64748b' }}>270px (기본)</h3>
          <div style={{ width: '270px' }}>
            <TaskCard label="법인 설립" count={12} onClick={fn()} />
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '8px', color: '#64748b' }}>350px</h3>
          <div style={{ width: '350px' }}>
            <TaskCard label="법인 설립" count={12} onClick={fn()} />
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '8px', color: '#64748b' }}>200px</h3>
          <div style={{ width: '200px' }}>
            <TaskCard label="법인 설립" count={12} onClick={fn()} />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '부모 컨테이너 너비에 따라 카드 너비가 변하는 것을 보여줍니다.',
      },
    },
  },
};
