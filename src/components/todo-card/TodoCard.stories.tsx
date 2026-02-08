import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { useState } from 'react';
import { fn } from 'storybook/test';

import TodoCard from './TodoCard';
import type { TodoItem } from './types/types';

const meta = {
  title: 'Components/TodoCard',
  component: TodoCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onKebabClick: fn(),
  },
  argTypes: {
    expanded: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TodoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: TodoItem[] = [
  { id: '1', text: '법인 설립 안내 드리기', checked: false },
  { id: '2', text: '법인 설립 혹은 변경 등기 비용 안내 드리기', checked: false },
  { id: '3', text: '입력해주신 정보를 바탕으로 등기신청서 제...', checked: true },
];

const completedItems: TodoItem[] = [
  { id: '1', text: '법인 설립 안내 드리기', checked: true },
  { id: '2', text: '법인 설립 혹은 변경 등기 비용 안내 드리기', checked: true },
  { id: '3', text: '입력해주신 정보를 바탕으로 등기신청서 제...', checked: true },
];

const ControlledTodoCard = ({
  items: initialItems,
  ...args
}: {
  items: TodoItem[];
  title: string;
}) => {
  const [items, setItems] = useState(initialItems);

  const handleCheckedChange = (id: string, checked: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)));
  };

  return <TodoCard {...args} items={items} onItemCheckedChange={handleCheckedChange} />;
};

export const Default: Story = {
  render: (args) => <ControlledTodoCard {...args} items={sampleItems} />,
  args: {
    title: '법인 설립',
  },
};

export const AllCompleted: Story = {
  render: (args) => <ControlledTodoCard {...args} items={completedItems} />,
  args: {
    title: '법인 설립',
  },
};

export const Collapsed: Story = {
  render: (args) => <ControlledTodoCard {...args} items={sampleItems} />,
  args: {
    title: '법인 설립',
    expanded: false,
  },
};

export const CollapsedCompleted: Story = {
  render: (args) => <ControlledTodoCard {...args} items={completedItems} />,
  args: {
    title: '법인 설립',
    expanded: false,
  },
};

export const Overview: Story = {
  render: () => {
    const [items1, setItems1] = useState(sampleItems);
    const [items2, setItems2] = useState(completedItems);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TodoCard
          title="진행 중인 할일"
          items={items1}
          onItemCheckedChange={(id, checked) =>
            setItems1((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)))
          }
        />
        <TodoCard
          title="완료된 할일"
          items={items2}
          onItemCheckedChange={(id, checked) =>
            setItems2((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)))
          }
        />
        <TodoCard title="접힌 상태 (진행 중)" items={sampleItems} expanded={false} />
        <TodoCard title="접힌 상태 (완료)" items={completedItems} expanded={false} />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};
