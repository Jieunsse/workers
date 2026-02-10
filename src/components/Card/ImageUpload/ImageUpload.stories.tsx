import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import ImageUpload from './ImageUpload';

const meta = {
  title: 'Components/Card/ImageUpload',
  component: ImageUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
ImageUpload는 이미지 업로드 UI 컴포넌트입니다.

- 최대 5개까지 이미지를 업로드할 수 있습니다.
- 업로드할 때마다 슬롯이 동적으로 추가됩니다.
- 각 슬롯에 "N/5" 형태로 현재 개수를 표시합니다.
- 업로드된 이미지는 미리보기와 함께 삭제 버튼이 표시됩니다.
- 파일 크기는 10MB로 제한되며, 이미지 파일만 업로드 가능합니다.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    images: {
      control: 'object',
      description: '업로드된 이미지 URL 배열',
    },
    maxImages: {
      control: 'number',
      description: '최대 업로드 개수 (default: 5)',
    },
    onFileSelect: {
      action: 'file-selected',
      description: '파일 선택 시 호출',
    },
    onRemove: {
      action: 'removed',
      description: '이미지 삭제',
    },
    size: {
      control: 'select',
      options: ['large', 'small'],
      description: '크기',
    },
  },
} satisfies Meta<typeof ImageUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 (이미지 없음)
export const Default: Story = {
  args: {
    images: [],
    maxImages: 5,
    onFileSelect: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '기본 상태입니다. 0/5 슬롯만 표시됩니다.',
      },
    },
  },
};

// 이미지 1개
export const OneImage: Story = {
  args: {
    images: ['https://picsum.photos/400/400'],
    maxImages: 5,
    onFileSelect: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '이미지 1개 업로드된 상태입니다. 이미지 슬롯 + 1/5 슬롯이 표시됩니다.',
      },
    },
  },
};

// 이미지 3개
export const ThreeImages: Story = {
  args: {
    images: [
      'https://picsum.photos/400/400',
      'https://picsum.photos/400/401',
      'https://picsum.photos/400/402',
    ],
    maxImages: 5,
    onFileSelect: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '이미지 3개 업로드된 상태입니다. 이미지 3개 + 3/5 슬롯이 표시됩니다.',
      },
    },
  },
};

// 최대 (5개)
export const Full: Story = {
  args: {
    images: [
      'https://picsum.photos/400/400',
      'https://picsum.photos/400/401',
      'https://picsum.photos/400/402',
      'https://picsum.photos/400/403',
      'https://picsum.photos/400/404',
    ],
    maxImages: 5,
    onFileSelect: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '최대 개수(5개) 업로드된 상태입니다. 업로드 버튼이 사라집니다.',
      },
    },
  },
};

// Small 크기
export const SmallSize: Story = {
  args: {
    images: ['https://picsum.photos/400/400', 'https://picsum.photos/400/401'],
    maxImages: 5,
    size: 'small',
    onFileSelect: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Small 크기입니다 (80x80).',
      },
    },
  },
};

// 최대 개수 3개로 제한
export const MaxThree: Story = {
  args: {
    images: ['https://picsum.photos/400/400'],
    maxImages: 3,
    onFileSelect: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '최대 개수를 3개로 제한한 예시입니다.',
      },
    },
  },
};

// 인터랙티브 예제
export const Interactive: Story = {
  args: {
    images: [],
    maxImages: 5,
    onFileSelect: fn(),
    onRemove: fn(),
  },
  render: (args) => {
    const InteractiveExample = () => {
      const [images, setImages] = useState<string[]>([]);

      const handleFileSelect = (file: File) => {
        // 실제로는 API 호출
        // const url = await uploadImage(file);

        // Mock: URL.createObjectURL 사용
        const url = URL.createObjectURL(file);
        setImages([...images, url]);
      };

      const handleRemove = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
      };

      return (
        <div>
          <ImageUpload
            images={images}
            maxImages={args.maxImages}
            onFileSelect={handleFileSelect}
            onRemove={handleRemove}
            size={args.size}
          />
          <p style={{ marginTop: '16px', color: '#64748b' }}>
            업로드된 이미지: {images.length}/{args.maxImages}
          </p>
        </div>
      );
    };

    return <InteractiveExample />;
  },
  parameters: {
    docs: {
      description: {
        story: '실제 파일 선택이 가능한 인터랙티브 예제입니다. 동적으로 슬롯이 추가됩니다.',
      },
    },
  },
};
