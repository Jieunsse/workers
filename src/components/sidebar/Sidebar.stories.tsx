import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';
import Image from 'next/image';
import Sidebar from './Sidebar';
import SidebarButton from './SidebarButton';
import SidebarTeamSelect from './SidebarTeamSelect';
import GnbAddButton from '@/components/Button/domain/GnbAddButton/GnbAddButton';
import chessSmall from '@/assets/icons/chess/chessSmall.svg';
import chessBig from '@/assets/icons/chess/chessBig.svg';
import boardSmall from '@/assets/icons/board/boardSmall.svg';
import boardLarge from '@/assets/icons/board/boardLarge.svg';

const TEAMS = ['경영관리팀', '프로덕트팀', '마케팅팀', '콘텐츠팀'];

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultCollapsed: { control: 'boolean' },
    isLoggedIn: { control: 'boolean' },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
    onProfileClick: fn(),
    profileImage: (
      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#cbd5e1' }} />
    ),
    profileName: '안해나',
    profileTeam: '경영관리팀',
    teamSelect: (isCollapsed: boolean) =>
      !isCollapsed && (
        <SidebarTeamSelect
          icon={<Image src={chessSmall} alt="" width={20} height={20} />}
          label="경영관리팀"
          isSelected
        />
      ),
    addButton: (isCollapsed: boolean) => (
      <>
        {!isCollapsed && <GnbAddButton label="팀 추가하기" onClick={() => {}} />}
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
        <SidebarButton
          icon={
            <Image
              src={isCollapsed ? boardLarge : boardSmall}
              alt=""
              width={isCollapsed ? 24 : 20}
              height={isCollapsed ? 24 : 20}
            />
          }
          label="자유게시판"
          iconOnly={isCollapsed}
          href="/boards"
        />
      </>
    ),
    children: (isCollapsed: boolean) => (
      <>
        {!isCollapsed &&
          TEAMS.map((team) => (
            <SidebarButton
              key={team}
              icon={<Image src={chessSmall} alt="" width={20} height={20} />}
              label={team}
              isActive={team === '경영관리팀'}
            />
          ))}
        {isCollapsed && (
          <SidebarButton
            icon={<Image src={chessBig} alt="" width={24} height={24} />}
            label="경영관리팀"
            isActive
            iconOnly
          />
        )}
      </>
    ),
  },
};

export const LoggedOut: Story = {
  args: {
    isLoggedIn: false,
    onProfileClick: fn(),
  },
};

export const LoggedOutCollapsed: Story = {
  args: {
    isLoggedIn: false,
    defaultCollapsed: true,
    onProfileClick: fn(),
  },
};

export const DefaultCollapsed: Story = {
  args: {
    ...LoggedIn.args,
    defaultCollapsed: true,
  },
};
