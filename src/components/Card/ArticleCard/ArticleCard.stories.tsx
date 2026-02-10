import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import ArticleCard from './ArticleCard';

const meta = {
  title: 'Components/Card/ArticleCard',
  component: ArticleCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
ArticleCard는 자유게시판 게시글을 카드 형태로 표시하는 컴포넌트입니다.

- 게시글 제목, 작성자, 작성일, 좋아요 수를 표시합니다.
- 인기글일 경우 "인기" 뱃지가 표시됩니다.
- 이미지가 있으면 우측에 표시되고, 없으면 텍스트가 전체 공간을 차지합니다.
- content 필드는 현재 API에 없지만, 추후 추가를 대비해 optional로 구현했습니다.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: 'number',
      description: '게시글 ID',
    },
    title: {
      control: 'text',
      description: '게시글 제목',
    },
    content: {
      control: 'text',
      description: '게시글 본문 (현재 API에 없음)',
    },
    writer: {
      control: 'object',
      description: '작성자 정보',
    },
    createdAt: {
      control: 'text',
      description: '작성일 (ISO 8601 형식)',
    },
    likeCount: {
      control: 'number',
      description: '좋아요 수',
    },
    image: {
      control: 'text',
      description: '첨부 이미지 URL',
    },
    isBest: {
      control: 'boolean',
      description: '인기글 여부',
    },
    onClick: {
      action: 'clicked',
      description: '클릭 이벤트 핸들러',
    },
  },
} satisfies Meta<typeof ArticleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock 데이터
const mockWriter = {
  id: 1,
  nickname: '우지윤',
};

// 기본
export const Default: Story = {
  args: {
    id: 1,
    title: '커피 머신 고장 신고합니다 🫠',
    writer: mockWriter,
    createdAt: '2024-07-25T09:00:00Z',
    likeCount: 24,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '523px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '기본 ArticleCard입니다. 이미지와 본문 미리보기가 없습니다. (전체 게시글: 523x156)',
      },
    },
  },
};

// 인기글 (베스트 게시글)
export const Best: Story = {
  args: {
    id: 2,
    title: '커피 머신 고장 신고합니다 🫠',
    writer: mockWriter,
    createdAt: '2024-07-25T09:00:00Z',
    likeCount: 999,
    isBest: true,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '인기글 뱃지가 표시됩니다. (베스트 게시글: 350x210)',
      },
    },
  },
};

// 이미지 있음 (전체 게시글)
export const WithImage: Story = {
  args: {
    id: 3,
    title: '커피 머신 고장 신고합니다 🫠',
    writer: mockWriter,
    createdAt: '2024-07-25T09:00:00Z',
    likeCount: 24,
    image: 'https://picsum.photos/400/400',
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '523px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '이미지가 우측에 표시됩니다. (전체 게시글: 523x156)',
      },
    },
  },
};

// 본문 미리보기 + 이미지 (베스트 게시글)
export const BestWithImageAndContent: Story = {
  args: {
    id: 4,
    title: '커피 머신 고장 신고합니다 🫠',
    content:
      '오늘 아침 출근과 동시에 알게 된 사실... 1층 커피 머신에서 물만 나옵니다. (커피는 실종 😭)',
    writer: mockWriter,
    createdAt: '2024-07-25T09:00:00Z',
    likeCount: 999,
    image: 'https://picsum.photos/400/400',
    isBest: true,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '본문 미리보기와 이미지가 모두 표시됩니다. (베스트 게시글: 350x210)',
      },
    },
  },
};

// 본문 미리보기 (현재 API에 없음)
export const WithContent: Story = {
  args: {
    id: 5,
    title: '커피 머신 고장 신고합니다 🫠',
    content:
      '오늘 아침 출근과 동시에 알게 된 사실... 1층 커피 머신에서 물만 나옵니다. (커피는 실종 😭) 점검 보냈으니 최대한 빨리 해결될 수 있도록 하겠습니다! 💪',
    writer: mockWriter,
    createdAt: '2024-07-25T09:00:00Z',
    likeCount: 24,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '523px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '본문 미리보기가 표시됩니다 (현재 API에는 없음). (전체 게시글: 523x156)',
      },
    },
  },
};

// 긴 제목
export const LongTitle: Story = {
  args: {
    id: 6,
    title:
      '매우 긴 제목을 가진 게시글입니다. 이렇게 긴 제목도 2줄까지만 표시되고 나머지는 말줄임표로 처리됩니다. 확인해보세요!',
    writer: mockWriter,
    createdAt: '2024-07-25T09:00:00Z',
    likeCount: 5,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '523px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '긴 제목은 2줄까지만 표시되고 말줄임표로 처리됩니다.',
      },
    },
  },
};

// 좋아요 999+
export const HighLikes: Story = {
  args: {
    id: 7,
    title: '인기 폭발! 좋아요 1000개 돌파',
    writer: mockWriter,
    createdAt: '2024-07-25T09:00:00Z',
    likeCount: 1234,
    isBest: true,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '좋아요가 1000개 이상이면 999+로 표시됩니다.',
      },
    },
  },
};

// 여러 개 나열 (전체 게시글)
export const MultipleAll: Story = {
  args: {
    id: 8,
    title: '커피 머신 고장 신고합니다',
    writer: mockWriter,
    createdAt: '2024-07-25T09:00:00Z',
    likeCount: 24,
  },
  render: () => {
    const articles = [
      {
        id: 1,
        title: '커피 머신 고장 신고합니다 🫠',
        writer: mockWriter,
        createdAt: '2024-07-25T09:00:00Z',
        likeCount: 999,
        image: 'https://picsum.photos/400/400',
      },
      {
        id: 2,
        title: '점심 메뉴 추천 부탁드립니다',
        writer: { id: 2, nickname: '김대해' },
        createdAt: '2024-07-24T14:30:00Z',
        likeCount: 156,
      },
      {
        id: 3,
        title: '회의실 예약 시스템 개선 제안',
        writer: { id: 3, nickname: '이연지' },
        createdAt: '2024-07-23T10:15:00Z',
        likeCount: 89,
        image: 'https://picsum.photos/400/401',
      },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '523px' }}>
        {articles.map((article) => (
          <ArticleCard key={article.id} {...article} onClick={fn()} />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '여러 개의 ArticleCard를 나열한 예시입니다 (전체 게시글: 523x156).',
      },
    },
  },
};

// 여러 개 나열 (베스트 게시글)
export const MultipleBest: Story = {
  args: {
    id: 9,
    title: '커피 머신 고장 신고합니다',
    writer: mockWriter,
    createdAt: '2024-07-25T09:00:00Z',
    likeCount: 999,
    isBest: true,
  },
  render: () => {
    const articles = [
      {
        id: 1,
        title: '커피 머신 고장 신고합니다 🫠',
        content: '오늘 아침 출근과 동시에 알게 된 사실... 1층 커피 머신에서 물만 나옵니다.',
        writer: mockWriter,
        createdAt: '2024-07-25T09:00:00Z',
        likeCount: 999,
        image: 'https://picsum.photos/400/400',
        isBest: true,
      },
      {
        id: 2,
        title: '점심 메뉴 추천 부탁드립니다',
        content: '오늘 점심 뭐 먹을까요? 추천 부탁드립니다!',
        writer: { id: 2, nickname: '김대해' },
        createdAt: '2024-07-24T14:30:00Z',
        likeCount: 856,
        isBest: true,
      },
      {
        id: 3,
        title: '회의실 예약 시스템 개선 제안',
        content: '회의실 예약 시스템이 불편해서 개선 제안드립니다.',
        writer: { id: 3, nickname: '이연지' },
        createdAt: '2024-07-23T10:15:00Z',
        likeCount: 789,
        image: 'https://picsum.photos/400/401',
        isBest: true,
      },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '350px' }}>
        {articles.map((article) => (
          <ArticleCard key={article.id} {...article} onClick={fn()} />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '여러 개의 베스트 게시글을 나열한 예시입니다 (베스트 게시글: 350x210).',
      },
    },
  },
};
