import React from 'react';
import { DatabaseOutlined } from '@ant-design/icons';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useTheme } from '@/providers/theme';

export interface ITableContextEmptyStateProps {
  containerId: string;
  componentId: string;
  className?: string;
  style?: React.CSSProperties;
}

export const TableContextEmptyState: React.FC<ITableContextEmptyStateProps> = ({
  containerId,
  componentId,
  className,
  style,
}) => {
  const selectedComponentId = useFormDesignerStateSelector((x) => x.selectedComponentId);
  const isSelected = selectedComponentId === componentId;
  const { theme } = useTheme();

  return (
    <div style={{ position: 'relative', minHeight: '120px', ...style }} className={className}>
      {/* Visual overlay showing the empty state message */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          border: '2px dashed #d9d9d9',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
          minHeight: '120px',
          gap: '12px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <DatabaseOutlined style={{
          fontSize: '48px',
          color: isSelected ? theme?.application.primaryColor : '#8c8c8c',
          flexShrink: 0,
        }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{
            color: isSelected ? theme?.application.primaryColor : '#8c8c8c',
            fontSize: '14px',
            fontWeight: '500',
          }}
          >
            Data Context Component
          </div>
          <div style={{
            color: '#bfbfbf',
            fontSize: '12px',
          }}
          >
            Drag & Drop a Form Component
          </div>
        </div>
      </div>

      {/* ComponentsContainer that handles the actual dropping */}
      <ComponentsContainer
        containerId={containerId}
        itemsLimit={-1}
        style={{ minHeight: '120px', position: 'relative', zIndex: 2 }}
      />
    </div>
  );
};

export default TableContextEmptyState;
