import React, { FC } from 'react';
import { Card, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTheme } from '@/providers';

const { Text } = Typography;

interface ISmartDefaultItemProps {
  /** The data record to display */
  data: any;
  /** Entity metadata to determine which properties to show */
  entityMetadata?: any;
  /** Whether we're in design mode */
  isDesignMode?: boolean;
  /** The index of this item in the list */
  itemIndex: number;
  /** Entity type name for context */
  entityType?: string;
}

/**
 * Simple placeholder item renderer for DataList when no formId is configured.
 * Shows only the ID with ellipses and prompts the configurator to set up a proper form template.
 */
export const SmartDefaultItem: FC<ISmartDefaultItemProps> = ({
  data,
  isDesignMode = false,
  itemIndex,
  entityType
}) => {
  const { theme } = useTheme();
  // Get a simple display name for the placeholder
  const getPlaceholderTitle = (): string => {
    return `${entityType || 'Item'} #${itemIndex + 1}`;
  };

  const formatIdDisplay = (id: any): React.ReactNode => {
    if (!id) return null;

    const idString = String(id);

    // For very short IDs (like 1, 2, 3), show them fully
    if (idString.length <= 6) {
      return (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          ID: {idString}
        </Text>
      );
    }

    // For GUID-like patterns (8-4-4-4-12), show first 8 chars
    const guidPattern = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (guidPattern.test(idString)) {
      const displayId = `${idString.substring(0, 8)}...`;
      return (
        <Text
          type="secondary"
          style={{ fontSize: '12px', cursor: 'help' }}
          title={`Full ID: ${idString}`}
        >
          ID: {displayId}
        </Text>
      );
    }

    // For other long IDs, show first 5 + ellipsis + last 3 if long enough
    let displayId: string;
    if (idString.length > 10) {
      displayId = `${idString.substring(0, 5)}...${idString.substring(idString.length - 3)}`;
    } else {
      displayId = `${idString.substring(0, 5)}...`;
    }

    return (
      <Text
        type="secondary"
        style={{ fontSize: '12px', cursor: 'help' }}
        title={`Full ID: ${idString} (click to copy)`}
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard?.writeText(idString);
        }}
      >
        ID: {displayId}
      </Text>
    );
  };

  if (!data) {
    return <Card size="small"><Text type="secondary">No data</Text></Card>;
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        margin: '4px 0',
        border: '1px dashed #d9d9d9',
        borderRadius: '6px',
        backgroundColor: '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '13px'
      }}
      className={isDesignMode ? 'sha-datalist-smart-default' : ''}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
        e.currentTarget.style.borderColor = '#bfbfbf';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fafafa';
        e.currentTarget.style.borderColor = '#d9d9d9';
      }}
    >
      {isDesignMode && itemIndex === 0 && (
        <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: theme.application.warningColor, borderRadius: '4px', fontSize: '11px' }}>
          <SettingOutlined style={{ marginRight: 4 }} />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Auto-display mode • Configure Form ID for data list item template ("Form" property in the Data section) 
          </Text>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
            {getPlaceholderTitle()}
          </Text>
          {data?.id && (
            <div style={{ marginTop: 4 }}>
              {formatIdDisplay(data.id)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartDefaultItem;