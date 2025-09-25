import { Table, Tag } from 'antd';
import { nanoid } from '@/utils/uuid';
import React, { FC, useMemo } from 'react';

const columns = [
  {
    title: 'Variable name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Datatype',
    key: 'type',
    dataIndex: 'type',
    render: (tag) => <Tag key={tag}>{tag}</Tag>,
  },
];

export interface ICodeExposedVariable {
  id?: string;
  name: string;
  description: string;
  type: string;
}

export interface ICodeVariablesTableProps {
  data?: ICodeExposedVariable[];
}

export const CodeVariablesTables: FC<ICodeVariablesTableProps> = ({ data }) => {
  const mappedVariables = useMemo(() => {
    return data?.map<ICodeExposedVariable>(({ id, ...rest }) => ({ ...rest, id: Boolean(id) ? id : nanoid() }));
  }, [data]);

  return <Table columns={columns} dataSource={mappedVariables} pagination={false} rowKey="id" />;
};
