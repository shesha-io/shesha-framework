import React, { FC } from 'react';
import { Button, Input, Switch, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { IRequestHeader } from './models';
import { useStyles } from './styles';

export interface IHeadersTabProps {
  headers: IRequestHeader[];
  onChange: (headers: IRequestHeader[]) => void;
}

export const HeadersTab: FC<IHeadersTabProps> = ({ headers, onChange }) => {
  const { styles } = useStyles();
  const handleAdd = () => {
    onChange([...headers, { key: '', value: '', enabled: true }]);
  };

  const handleUpdate = (index: number, field: keyof IRequestHeader, value: any) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: '35%',
      render: (text: string, _: IRequestHeader, index: number) => (
        <Input
          value={text}
          placeholder="Header name (e.g., Content-Type)"
          onChange={(e) => handleUpdate(index, 'key', e.target.value)}
        />
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: '45%',
      render: (text: string, _: IRequestHeader, index: number) => (
        <Input
          value={text}
          placeholder="Header value"
          onChange={(e) => handleUpdate(index, 'value', e.target.value)}
        />
      ),
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      width: '10%',
      render: (checked: boolean, _: IRequestHeader, index: number) => (
        <Switch
          checked={checked}
          onChange={(value) => handleUpdate(index, 'enabled', value)}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: '10%',
      render: (_: any, __: IRequestHeader, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(index)}
        />
      ),
    },
  ];

  return (
    <div className={styles.requestTable}>
      <Table
        dataSource={headers.map((header, index) => ({ ...header, rowKey: index }))}
        columns={columns}
        pagination={false}
        size="small"
        rowKey="rowKey"
      />
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        className={styles.addRowBtn}
        block
      >
        Add Header
      </Button>
    </div>
  );
};
