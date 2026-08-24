import React, { ReactNode } from 'react';
import { Table, Tag, Typography, Space, Badge, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { ItemValidationResult } from '@/providers/validator/interfaces';
import { ISheshaErrorTypes } from '@/utils/errors';
import { useFormDesigner } from '@/providers/formDesigner';

const { Text, Link } = Typography;

export interface ValidationPanelProps {
  /** Array of validation results to display */
  data: ItemValidationResult[];
  /** Show a summary with counts above the table */
  showSummary?: boolean;
  /** Table size – defaults to "middle" */
  size?: 'small' | 'middle' | 'large';
  /** If true, the table will be scrollable vertically */
  scrollY?: number;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  data,
  showSummary = true,
  size = 'middle',
  scrollY,
}) => {
  const formDesigner = useFormDesigner();
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
      // dataIndex: 'itemName',
      key: 'itemName',
      // width: 120,
      render: (_, record) => {
        switch (record.itemType) {
          case "component": {
            return !isNullOrWhiteSpace(record.itemName) ? record.itemName : <Text type="secondary">{record.itemId}</Text>;
          }
          case "form-settings": {
            return "Form Settings";
          }
        }
        return undefined;
      },
    },
    // {
    //   title: 'Item Type',
    //   dataIndex: 'itemType',
    //   key: 'itemType',
    //   width: 120,
    // },
    // {
    //   title: 'ItemId',
    //   dataIndex: 'itemId',
    //   key: 'itemId',
    // },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc?: string) => !isNullOrWhiteSpace(desc) ? desc : <Text type="secondary">—</Text>,
    },
    {
      title: 'Documentation',
      dataIndex: 'documentationUrl',
      key: 'documentationUrl',
      width: 140,
      render: (url?: string) =>
        !isNullOrWhiteSpace(url) ? (
          <Link href={url} target="_blank" rel="noopener noreferrer">
            <Button type="link" icon={<QuestionCircleOutlined />} size="small">
              Learn more
            </Button>
          </Link>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  return (
    <div className="validation-panel">
      {showSummary && data.length > 0 && (
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
        rowKey={(record, index) => `${record.type}-${record.message}-${index}`}
        size={size}
        pagination={false}
        {...(isDefined(scrollY) ? { scroll: { y: scrollY } } : {})}
        bordered
        locale={{ emptyText: 'No validation results' }}
        onRow={(record, _rowIndex) => ({
          onClick: (event) => {
            event.stopPropagation();
            if (record.itemType === "component") {
              formDesigner.setSelectedComponent(record.itemId);
            }
          },
        })}
      />
    </div>
  );
};

export default ValidationPanel;
