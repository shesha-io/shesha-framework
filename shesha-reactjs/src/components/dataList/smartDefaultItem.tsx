import React, { FC, useMemo } from 'react';
import { Card, Typography, Tag, Space, Alert } from 'antd';
import { SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { IPropertyMetadata, DataTypes } from '@/interfaces/metadata';

const { Text, Title } = Typography;

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
 * Smart default item renderer for DataList when no form is configured.
 * Automatically detects and displays relevant properties from the entity.
 */
export const SmartDefaultItem: FC<ISmartDefaultItemProps> = ({
  data,
  entityMetadata,
  isDesignMode = false,
  itemIndex,
  entityType
}) => {
  // Helper function to format property names into readable labels
  const formatLabel = (key: string): string => {
    // Convert camelCase/PascalCase to readable labels
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Determine which properties to show
  const displayProperties = useMemo(() => {
    if (!data || typeof data !== 'object') return [];

    const properties: Array<{ key: string; value: any; label: string; type: string; priority: number }> = [];

    // Get actual data properties
    const dataKeys = Object.keys(data);

    // Priority order for common property names
    const highPriorityFields = [
      'displayName', '_displayName', 'name', 'title', 'firstName', 'lastName',
      'fullName', 'email', 'description', 'code', 'reference'
    ];
    const mediumPriorityFields = [
      'jobTitle', 'position', 'department', 'phoneNumber', 'mobile', 'status',
      'category', 'type', 'creationTime', 'lastModificationTime'
    ];
    const skipFields = [
      'id', 'Id', '_className', '__typename', 'tenantId', 'isDeleted',
      'deleterUserId', 'deletionTime', 'lastModifierUserId', 'creatorUserId'
    ];

    dataKeys.forEach(key => {
      const value = data[key];

      // Skip null/undefined values and system fields
      if (value == null || skipFields.includes(key)) return;

      // Skip complex objects and arrays for display
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) return;
      if (Array.isArray(value) && value.length === 0) return;

      // Determine priority
      let priority = 3; // low priority by default
      if (highPriorityFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        priority = 1; // high priority
      } else if (mediumPriorityFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        priority = 2; // medium priority
      }

      // Determine display type
      let displayType = 'text';
      if (typeof value === 'boolean') displayType = 'boolean';
      else if (typeof value === 'number') displayType = 'number';
      else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) displayType = 'date';

      properties.push({
        key,
        value,
        label: formatLabel(key),
        type: displayType,
        priority
      });
    });

    // Sort by priority and limit to most relevant properties
    return properties
      .sort((a, b) => a.priority - b.priority || a.key.localeCompare(b.key))
      .slice(0, 6); // Show max 6 properties to avoid clutter
  }, [data]);

  const formatValue = (value: any, type: string): React.ReactNode => {
    if (value == null) return <Text type="secondary">-</Text>;

    switch (type) {
      case 'boolean':
        return <Tag color={value ? 'green' : 'red'}>{value ? 'Yes' : 'No'}</Tag>;

      case 'number':
        return <Text strong>{value.toLocaleString()}</Text>;

      case 'date':
        try {
          const date = new Date(value);
          return <Text>{date.toLocaleDateString()}</Text>;
        } catch {
          return <Text>{value}</Text>;
        }

      default:
        // Truncate long text values
        const text = String(value);
        if (text.length > 50) {
          return <Text title={text}>{text.substring(0, 47)}...</Text>;
        }
        return <Text>{text}</Text>;
    }
  };

  const getPrimaryDisplayValue = (): string => {
    // Try to get the most important value for the title
    const primaryField = displayProperties.find(p => p.priority === 1);
    if (primaryField) return String(primaryField.value);

    // Try various common display name properties
    if (data.displayName) return data.displayName;
    if (data._displayName) return data._displayName;
    if (data.name) return data.name;
    if (data.title) return data.title;
    if (data.firstName && data.lastName) return `${data.firstName} ${data.lastName}`;
    if (data.firstName) return data.firstName;
    if (data.lastName) return data.lastName;

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
    let displayId;
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
        padding: '8px 12px',
        margin: '4px 0',
        border: '1px solid #f0f0f0',
        borderRadius: '6px',
        backgroundColor: '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '13px'
      }}
      className={isDesignMode ? 'sha-datalist-smart-default' : ''}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
        e.currentTarget.style.borderColor = '#d9d9d9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fafafa';
        e.currentTarget.style.borderColor = '#f0f0f0';
      }}
    >
      {isDesignMode && itemIndex === 0 && (
        <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: '#e6f7ff', borderRadius: '4px', fontSize: '11px' }}>
          <SettingOutlined style={{ marginRight: 4, color: '#1890ff' }} />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Auto-display mode • Configure Form ID for data list item template ("Form" property in the Data section)
          </Text>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ color: '#1890ff', fontSize: '13px' }}>
            {getPrimaryDisplayValue()}
          </Text>
          {data.id && (
            <div style={{ marginTop: 2 }}>
              {formatIdDisplay(data.id)}
            </div>
          )}
        </div>

        {displayProperties.length > 0 && (
          <div style={{ marginLeft: 12, textAlign: 'right', opacity: 0.7 }}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {displayProperties.length} field{displayProperties.length !== 1 ? 's' : ''}
            </Text>
          </div>
        )}
      </div>

      {displayProperties.length === 0 && (
        <div style={{ marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            No displayable properties • Configure form item template ("Form" property in the Data section)
          </Text>
        </div>
      )}
    </div>
  );
};

export default SmartDefaultItem;