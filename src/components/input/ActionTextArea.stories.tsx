import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import ActionTextArea from './ActionTextArea';

const meta = {
  title: 'Components/ActionTextArea',
  component: ActionTextArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    placeholder: '텍스트를 입력해 주세요.',
    onSubmit: fn(),
    onChange: fn(),
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActionTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: {
    placeholder: '댓글을 입력해 주세요.',
  },
};

export const Overview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 460 }}>
      <ActionTextArea placeholder="기본 ActionTextArea" />
      <ActionTextArea placeholder="댓글을 입력해 주세요." />
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};
