import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AccountInput from './AccountInput';

const meta = {
  title: 'Components/AccountInput',
  component: AccountInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    email: 'user@example.com',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithButton: Story = {
  args: {
    email: 'user@example.com',
    children: (
      <button
        type="button"
        style={{
          padding: '8px 16px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        변경하기
      </button>
    ),
  },
};

export const Overview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 460 }}>
      <AccountInput email="user@example.com" />
      <AccountInput email="user@example.com">
        <button
          type="button"
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          변경하기
        </button>
      </AccountInput>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};
