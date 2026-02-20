import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';
import Image from 'next/image';

import SidebarButton from './SidebarButton';
import chessSmall from '@/assets/icons/chess/chessSmall.svg';
import chessBig from '@/assets/icons/chess/chessBig.svg';
import boardSmall from '@/assets/icons/board/boardSmall.svg';

const meta = {
  title: 'Components/SidebarButton',
  component: SidebarButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    icon: <Image src={chessSmall} alt="" width={20} height={20} />,
    label: '경영관리팀',
    onClick: fn(),
  },
  argTypes: {
    isActive: {
      control: 'boolean',
    },
    iconOnly: {
      control: 'boolean',
    },
    href: {
      control: 'text',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const IconOnly: Story = {
  args: {
    icon: <Image src={chessBig} alt="" width={24} height={24} />,
    iconOnly: true,
  },
};

export const WithLink: Story = {
  args: {
    icon: <Image src={boardSmall} alt="" width={20} height={20} />,
    label: '자유게시판',
    href: '/boards',
  },
};

export const Overview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 240 }}>
      <SidebarButton
        icon={<Image src={chessSmall} alt="" width={20} height={20} />}
        label="경영관리팀"
      />
      <SidebarButton
        icon={<Image src={chessSmall} alt="" width={20} height={20} />}
        label="경영관리팀"
        isActive
      />
      <SidebarButton
        icon={<Image src={chessBig} alt="" width={24} height={24} />}
        label="경영관리팀"
        iconOnly
      />
      <SidebarButton
        icon={<Image src={boardSmall} alt="" width={20} height={20} />}
        label="자유게시판"
        href="/boards"
      />
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};
