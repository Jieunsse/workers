import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import MobileHeader from './MobileHeader';

const meta = {
  title: 'Components/MobileHeader',
  component: MobileHeader,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  tags: ['autodocs'],
  argTypes: {
    logoWidth: { control: 'number' },
    logoHeight: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 375 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MobileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
    profileImage: (
      <div style={{ width: 32, height: 32, borderRadius: 12, background: '#cbd5e1' }} />
    ),
    onMenuClick: fn(),
    onProfileClick: fn(),
  },
};

export const CustomLogoSize: Story = {
  args: {
    logoWidth: 80,
    logoHeight: 16,
  },
};
