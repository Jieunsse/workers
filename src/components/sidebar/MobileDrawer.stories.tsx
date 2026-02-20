import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';
import Image from 'next/image';

import MobileDrawer from './MobileDrawer';
import SidebarButton from './SidebarButton';
import SidebarAddButton from './SidebarAddButton';
import chessSmall from '@/assets/icons/chess/chessSmall.svg';
import boardSmall from '@/assets/icons/board/boardSmall.svg';

const TEAMS = ['경영관리팀', '프로덕트팀', '마케팅팀', '콘텐츠팀'];

const meta = {
  title: 'Components/MobileDrawer',
  component: MobileDrawer,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MobileDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    children: (
      <>
        {TEAMS.map((team) => (
          <SidebarButton
            key={team}
            icon={<Image src={chessSmall} alt="" width={20} height={20} />}
            label={team}
            isActive={team === '경영관리팀'}
          />
        ))}
        <SidebarAddButton label="팀 추가하기" />
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
        <SidebarButton
          icon={<Image src={boardSmall} alt="" width={20} height={20} />}
          label="자유게시판"
          href="/boards"
        />
      </>
    ),
  },
};
