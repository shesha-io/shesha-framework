import React, { ReactNode } from 'react';
import { Table, Tag, Typography, Space, Badge, Button, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { ItemValidationResult } from '@/providers/validator/interfaces';
import { ISheshaErrorTypes } from '@/utils/errors';
import { useFormDesigner } from '@/providers/formDesigner';
import { useAllValidationResults } from '@/providers/validator/hooks';
import { useIsDevMode } from '@/hooks/useIsDevMode';

const { Text } = Typography;

export interface ValidationPanelProps {
  /** Show a summary with counts above the table */
  showSummary?: boolean;
  /** Table size – defaults to "middle" */
  size?: 'small' | 'middle' | 'large';
  /** If true, the table will be scrollable vertically */
  scrollY?: number;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  showSummary = true,
  size = 'small',
  scrollY,
}) => {
  const formDesigner = useFormDesigner();
  const data = useAllValidationResults();
  const isDevMode = useIsDevMode();

  // Count results by type
  const counts = React.useMemo(() => {
    return data.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      },
      {} as Record<ISheshaErrorTypes, number>,
    );
  }, [data]);

  // Render tag for type column
  const renderTypeTag = (type: ISheshaErrorTypes): ReactNode => {
    const colorMap: Record<ISheshaErrorTypes, string> = {
      error: 'red',
      warning: 'orange',
      info: 'blue',
    };
    const labelMap: Record<ISheshaErrorTypes, string> = {
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    };
    return <Tag color={colorMap[type]}>{labelMap[type]}</Tag>;
  };

  // Table columns
  const columns: ColumnsType<ItemValidationResult> = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: ISheshaErrorTypes) => renderTypeTag(type),
      filters: [
        { text: 'Error', value: 'error' },
        { text: 'Warning', value: 'warning' },
        { text: 'Info', value: 'info' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Item',
      key: 'itemName',
      render: (_, record) => {
        return (
          <Button
            type="link"
            onClick={(event) => {
              event.stopPropagation();
              if (record.itemType === "component") {
                formDesigner.setSelectedComponent(record.itemId);
                // form.scrollToField('bio')
              }
            }}
          >
            {record.displayName}
          </Button>
        );
      },
    },
    {
      title: 'Item Id',
      dataIndex: 'itemId',
      key: 'itemId',
      hidden: !isDevMode,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (_, record) => {
        const propName = typeof (record.propertyLabel) === "string" && !isNullOrWhiteSpace(record.propertyLabel)
          ? record.propertyLabel
          : record.propertyName;
        return isDefined(propName)
          ? `${propName}: ${record.message}`
          : record.message;
      },
    },
  ];

  return data.length > 0
    ? (
      <div>
        {showSummary && (
          <Space size="large" style={{ marginBottom: 16 }}>
            <Badge count={counts.error || 0} style={{ backgroundColor: '#ff4d4f' }}>
              <Text strong>Errors</Text>
            </Badge>
            <Badge count={counts.warning || 0} style={{ backgroundColor: '#faad14' }}>
              <Text strong>Warnings</Text>
            </Badge>
            <Badge count={counts.info || 0} style={{ backgroundColor: '#1890ff' }}>
              <Text strong>Info</Text>
            </Badge>
            <Text type="secondary">|</Text>
            <Text strong>Total: {data.length}</Text>
          </Space>
        )}

        <Table<ItemValidationResult>
          dataSource={data}
          columns={columns}
          rowKey={(record) => record.key}
          size={size}
          pagination={false}
          {...(isDefined(scrollY) ? { scroll: { y: scrollY } } : {})}
          bordered
          locale={{ emptyText: 'No validation results' }}
        />
      </div>
    )
    : (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Congratulations! No problems found."
      />
    );
};
