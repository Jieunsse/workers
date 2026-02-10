import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import CommentInput from './CommentInput';

const meta = {
  title: 'Components/CommentInput',
  component: CommentInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    placeholder: '댓글을 달아주세요.',
    onSubmit: fn(),
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 460 }}>
      <CommentInput placeholder="댓글을 달아주세요." />
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};
