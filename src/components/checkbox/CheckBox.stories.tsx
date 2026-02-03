import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import CheckBox from './CheckBox';

const meta = {
  title: 'Components/CheckBox',
  component: CheckBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    checked: false,
    label: '동의합니다',
    onCheckedChange: fn(),
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['large', 'small'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof CheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const ControlledCheckBox: Story['render'] = (args) => {
  const [{ checked }, updateArgs] = useArgs();

  const handleCheckedChange = (nextChecked: boolean) => {
    updateArgs({ checked: nextChecked });
    args.onCheckedChange?.(nextChecked);
  };

  return <CheckBox {...args} checked={checked} onCheckedChange={handleCheckedChange} />;
};

export const Default: Story = {
  render: ControlledCheckBox,
};

export const Checked: Story = {
  render: ControlledCheckBox,
  args: {
    checked: true,
  },
};

export const Small: Story = {
  render: ControlledCheckBox,
  args: {
    size: 'small',
  },
};

export const Disabled: Story = {
  render: ControlledCheckBox,
  args: {
    disabled: true,
  },
};

export const Overview: Story = {
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '100px repeat(4, max-content)',
        columnGap: '24px',
        rowGap: '16px',
        alignItems: 'center',
      }}
    >
      <span />
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Large</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Small</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>비활성 Large</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>비활성 Small</span>

      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>체크됨</span>
      <CheckBox {...args} label="Large" checked />
      <CheckBox {...args} label="Small" size="small" checked />
      <CheckBox {...args} label="Large" disabled checked />
      <CheckBox {...args} label="Small" size="small" disabled checked />

      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>체크 안됨</span>
      <CheckBox {...args} label="Large" checked={false} />
      <CheckBox {...args} label="Small" size="small" checked={false} />
      <CheckBox {...args} label="Large" disabled checked={false} />
      <CheckBox {...args} label="Small" size="small" disabled checked={false} />
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};

export const WithoutLabel: Story = {
  render: ControlledCheckBox,
  args: {
    label: undefined,
    options: {
      ariaLabel: '동의 체크박스',
    },
  },
};
