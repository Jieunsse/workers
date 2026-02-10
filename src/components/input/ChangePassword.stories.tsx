import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import ChangePassword from './ChangePassword';

const meta = {
  title: 'Components/ChangePassword',
  component: ChangePassword,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    isEditing: false,
    newPasswordProps: {
      onChange: fn(),
    },
    confirmPasswordProps: {
      onChange: fn(),
    },
  },
  argTypes: {
    isEditing: {
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
} satisfies Meta<typeof ChangePassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
  args: {
    isEditing: true,
  },
};

export const WithError: Story = {
  args: {
    isEditing: true,
    confirmPasswordProps: {
      errorMessage: '비밀번호가 일치하지 않습니다.',
    },
  },
};

export const WithButtons: Story = {
  args: {
    isEditing: true,
    children: (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          style={{
            padding: '8px 16px',
            background: '#e2e8f0',
            color: '#0f172a',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          취소
        </button>
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
      </div>
    ),
  },
};

export const Overview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: 460 }}>
      <div>
        <p style={{ marginBottom: 8, fontWeight: 600 }}>비활성 상태</p>
        <ChangePassword isEditing={false} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontWeight: 600 }}>편집 상태</p>
        <ChangePassword isEditing />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontWeight: 600 }}>에러 상태</p>
        <ChangePassword
          isEditing
          confirmPasswordProps={{ errorMessage: '비밀번호가 일치하지 않습니다.' }}
        />
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};
