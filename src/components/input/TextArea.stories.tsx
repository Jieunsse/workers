import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import TextArea from './TextArea';

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    placeholder: '텍스트를 입력해 주세요.',
    onChange: fn(),
  },
  argTypes: {
    rows: {
      control: 'number',
    },
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
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRows: Story = {
  args: {
    rows: 5,
    placeholder: '여러 줄 입력',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '비활성 상태',
  },
};

export const Overview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 460 }}>
      <TextArea placeholder="기본 TextArea" />
      <TextArea placeholder="여러 줄" rows={5} />
      <TextArea placeholder="비활성" disabled />
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};
