import React from 'react';
import { TableOutlined, SettingOutlined } from '@ant-design/icons';
import { useFormDesignerSelectedComponentId } from '@/providers/formDesigner';
import { useTheme } from '@/providers/theme';

export interface ITableEmptyStateProps {
  componentId: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Empty state displayed when a DataTable has no configured columns
 * Prompts users to click the Settings icon to configure columns
 */
export const TableEmptyState: React.FC<ITableEmptyStateProps> = ({
  componentId,
  className,
  style,
}) => {
  const selectedComponentId = useFormDesignerSelectedComponentId();
  const isSelected = selectedComponentId === componentId;
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        border: '2px dashed #d9d9d9',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        minHeight: '200px',
        gap: '16px',
        ...style,
      }}
      className={className}
    >
      <TableOutlined
        style={{
          fontSize: '64px',
          color: isSelected ? theme?.application?.primaryColor : '#bfbfbf',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center', maxWidth: '400px' }}>
        <div
          style={{
            color: isSelected ? theme?.application?.primaryColor : '#595959',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          No Columns Configured
        </div>
        <div
          style={{
            color: '#8c8c8c',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          This Data Table needs columns to display data.
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            padding: '12px 20px',
            backgroundColor: isSelected ? theme?.application?.primaryColor + '15' : '#fff',
            border: `1px solid ${isSelected ? theme?.application?.primaryColor : '#d9d9d9'}`,
            borderRadius: '6px',
            color: isSelected ? theme?.application?.primaryColor : '#595959',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <SettingOutlined style={{ fontSize: '16px' }} />
          Configure Columns in the Properties Panel
        </div>
      </div>
    </div>
  );
};

export default TableEmptyState;
