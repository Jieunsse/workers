import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import Chip from './Chip';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Chip은 필터, 카테고리, 상태 선택 등에 사용되는 선택형 UI 컴포넌트입니다.

- 텍스트(label)와 선택적으로 개수(count)를 표시할 수 있습니다.
- 크기(size)는 large / small 두 가지를 제공합니다.
- Figma 시안에서의 "pressed"(파란색) 상태는 선택이 유지되는 상태로 해석하여
  \`selected\` prop으로 구현되었습니다.
- 마우스로 누르는 순간의 피드백은 CSS \`:active\` 상태로 처리되며,
  선택 상태(selected)와는 개념적으로 분리되어 있습니다.
- 모바일/태블릿 환경에서는 Chip 형태로 사용되며,
  PC 환경에서는 동일한 데이터를 카드(Card) 컴포넌트로 표현할 수 있습니다.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '칩에 표시될 텍스트',
    },
    count: {
      control: 'number',
      description: '개수 표시 (optional)',
    },
    size: {
      control: 'select',
      options: ['large', 'small'],
      description: '칩 크기',
    },
    selected: {
      control: 'boolean',
      description: '선택 상태 (선택이 유지되는 상태)',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    onClick: {
      action: 'clicked',
      description: '클릭 이벤트 핸들러',
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 (Default)
export const Default: Story = {
  args: {
    label: '법인 등기',
    count: 3,
    size: 'large',
  },
  parameters: {
    docs: {
      description: {
        story: '기본 상태의 Chip입니다. 선택되지 않은 초기 상태를 나타냅니다.',
      },
    },
  },
};

// Small 사이즈
export const Small: Story = {
  args: {
    label: '법인 등기',
    count: 3,
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small 사이즈 Chip 예시입니다.',
      },
    },
  },
};

// Selected 상태
export const Selected: Story = {
  args: {
    label: '법인 등기',
    count: 3,
    size: 'large',
    selected: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '선택된 상태의 Chip입니다. Figma 시안에서의 "pressed" 상태를 의미하며, 선택이 유지됩니다.',
      },
    },
  },
};

// Count 없는 경우
export const WithoutCount: Story = {
  args: {
    label: '법인 등기',
    size: 'large',
  },
  parameters: {
    docs: {
      description: {
        story: 'count 없이 label만 표시되는 Chip 예시입니다.',
      },
    },
  },
};

// Disabled 상태
export const Disabled: Story = {
  args: {
    label: '법인 등기',
    count: 3,
    size: 'large',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: '비활성화된 Chip 상태입니다. 클릭이 불가능합니다.',
      },
    },
  },
};

// 모든 상태 비교 (Playground)
export const AllStates: Story = {
  args: {
    label: '법인 등기',
    count: 3,
  },
  render: () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Large */}
        <div>
          <h3 style={{ marginBottom: '16px', color: '#64748b' }}>Large</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Chip label="법인 등기" count={3} size="large" />
            <Chip label="법인 등기" count={3} size="large" selected />
            <Chip label="법인 등기" count={3} size="large" disabled />
          </div>
        </div>

        {/* Small */}
        <div>
          <h3 style={{ marginBottom: '16px', color: '#64748b' }}>Small</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Chip label="법인 등기" count={3} size="small" />
            <Chip label="법인 등기" count={3} size="small" selected />
            <Chip label="법인 등기" count={3} size="small" disabled />
          </div>
        </div>

        {/* Without Count */}
        <div>
          <h3 style={{ marginBottom: '16px', color: '#64748b' }}>Without Count</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Chip label="법인 등기" size="large" />
            <Chip label="법인 등기" size="large" selected />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Chip의 크기별(large/small) 및 상태별(default, selected, disabled) 모습을 한눈에 비교할 수 있는 예시입니다.',
      },
    },
  },
};

// 실제 사용 예시 (Interactive)
export const InteractiveExample: Story = {
  args: {
    label: '법인 설립',
    count: 3,
  },
  render: () => {
    const ChipGroup = () => {
      const [selectedChip, setSelectedChip] = useState<string | null>('법인 설립');

      const chips = [
        { id: '법인 설립', label: '법인 설립', count: 3 },
        { id: '변경 등기', label: '변경 등기', count: 2 },
        { id: '법인 폐업', label: '법인 폐업', count: 5 },
      ];

      return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {chips.map((chip) => (
            <Chip
              key={chip.id}
              label={chip.label}
              count={chip.count}
              size="large"
              selected={selectedChip === chip.id}
              onClick={() => setSelectedChip(chip.id)}
            />
          ))}
        </div>
      );
    };

    return <ChipGroup />;
  },
  parameters: {
    docs: {
      description: {
        story:
          '실제 사용 예시입니다. 여러 Chip 중 하나를 선택하는 단일 선택(single-select) 패턴을 보여줍니다.',
      },
    },
  },
};
