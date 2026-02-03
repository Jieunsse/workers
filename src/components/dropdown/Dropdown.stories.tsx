import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import Dropdown from './Dropdown';
import type { DropdownItemData } from './types/types';

const ITEMS: DropdownItemData[] = [
  { value: 'all', label: '전체' },
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
  { value: 'price', label: '가격순' },
];

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    items: ITEMS,
    placeholder: '정렬 기준 선택',
    ariaLabel: '정렬 기준',
    onChange: fn(),
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['default', 'small', 'repeat'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'popular',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const Repeat: Story = {
  args: {
    size: 'repeat',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Overview: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Dropdown {...args} size="default" placeholder="기본 사이즈" />
      <Dropdown {...args} size="small" placeholder="작은 사이즈" />
      <Dropdown {...args} size="repeat" placeholder="Repeat" />
      <Dropdown {...args} disabled placeholder="비활성" />
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};
