import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';

import { useState } from 'react';
import { fn } from 'storybook/test';

import TodoCard from './TodoCard';
import type { TodoItem } from './types/types';

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

const meta = {
  title: 'Components/TodoCard',
  component: TodoCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    title: '법인 설립',
    items: sampleItems,
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

const ControlledTodoCard = (args: ComponentProps<typeof TodoCard>) => {
  const [items, setItems] = useState(args.items);

  const handleCheckedChange = (id: string, checked: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)));
  };

  return <TodoCard {...args} items={items} onItemCheckedChange={handleCheckedChange} />;
};

export const Default: Story = {
  render: (args) => <ControlledTodoCard {...args} />,
};

export const AllCompleted: Story = {
  render: (args) => <ControlledTodoCard {...args} />,
  args: {
    items: completedItems,
  },
};

export const Collapsed: Story = {
  render: (args) => <ControlledTodoCard {...args} />,
  args: {
    expanded: false,
  },
};

export const CollapsedCompleted: Story = {
  render: (args) => <ControlledTodoCard {...args} />,
  args: {
    items: completedItems,
    expanded: false,
  },
};

export const Overview: Story = {
  render: (args) => {
    const [items1, setItems1] = useState(sampleItems);
    const [items2, setItems2] = useState(completedItems);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TodoCard
          {...args}
          title="진행 중인 할일"
          items={items1}
          onItemCheckedChange={(id, checked) =>
            setItems1((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)))
          }
        />
        <TodoCard
          {...args}
          title="완료된 할일"
          items={items2}
          onItemCheckedChange={(id, checked) =>
            setItems2((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)))
          }
        />
        <TodoCard {...args} title="접힌 상태 (진행 중)" items={sampleItems} expanded={false} />
        <TodoCard {...args} title="접힌 상태 (완료)" items={completedItems} expanded={false} />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};
