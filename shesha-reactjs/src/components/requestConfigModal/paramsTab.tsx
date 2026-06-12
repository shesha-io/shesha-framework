import React, { FC } from 'react';
import { Button, Input, Switch, Table, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { IRequestParam } from './models';
import { useStyles } from './styles';

const { TextArea } = Input;

export interface IParamsTabProps {
  params: IRequestParam[];
  onChange: (params: IRequestParam[]) => void;
}

export const ParamsTab: FC<IParamsTabProps> = ({ params, onChange }) => {
  const { styles } = useStyles();
  const handleAdd = () => {
    onChange([...params, { key: '', value: '', description: '', enabled: true }]);
  };

  const handleUpdate = (index: number, field: keyof IRequestParam, value: any) => {
    const updated = [...params];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(params.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: '25%',
      render: (text: string, _: IRequestParam, index: number) => (
        <Input
          value={text}
          placeholder="Parameter name"
          onChange={(e) => handleUpdate(index, 'key', e.target.value)}
        />
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: '25%',
      render: (text: string, record: IRequestParam, index: number) => {
        // Special handling for 'properties' parameter (Shesha GraphQL-like syntax)
        const isPropertiesParam = typeof record?.key === 'string' && record.key.toLowerCase() === 'properties';

        if (isPropertiesParam) {
          return (
            <TextArea
              value={text}
              placeholder="firstName lastName address { addressLine1 city }"
              onChange={(e) => handleUpdate(index, 'value', e.target.value)}
              rows={3}
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
            />
          );
        }

        return (
          <Input
            value={text}
            placeholder="Parameter value"
            onChange={(e) => handleUpdate(index, 'value', e.target.value)}
          />
        );
      },
    },
    {
      title: () => (
        <span>
          Description{' '}
          <Tooltip title="For 'properties' parameter, use GraphQL-like syntax: firstName lastName address { addressLine1 }">
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      render: (text: string, record: IRequestParam, index: number) => {
        const isPropertiesParam = typeof record?.key === 'string' && record.key.toLowerCase() === 'properties';

        return (
          <Input
            value={text}
            placeholder={isPropertiesParam ? "GraphQL-like property selection" : "Optional description"}
            onChange={(e) => handleUpdate(index, 'description', e.target.value)}
          />
        );
      },
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      width: '10%',
      render: (checked: boolean, _: IRequestParam, index: number) => (
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
      render: (_: any, __: IRequestParam, index: number) => (
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
        dataSource={params.map((param, index) => ({ ...param, rowKey: index }))}
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
        Add Parameter
      </Button>
    </div>
  );
};
