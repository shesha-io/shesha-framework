import { CodeVariablesTables } from '@/components/codeVariablesTable';
import { ListEditorRenderer } from '@/components/listEditorRenderer';
import QueryBuilderExpressionViewer from '@/designer-components/queryBuilder/queryBuilderExpressionViewer';
import { QueryBuilderPlainRenderer } from '@/designer-components/queryBuilder/queryBuilderFieldPlain';
import { QueryBuilderProvider, useMetadata } from '@/providers';
import { ITableViewProps } from '@/providers/dataTable/filters/models';
import { Tabs } from 'antd';
import React, { FC } from 'react';
import { FilterItemProperties } from './filterItemProperties';

export interface IFilterItemSettingsEditorProps {
  value?: ITableViewProps;
  onChange: (newValue: ITableViewProps) => void;
  readOnly: boolean;
}

export const FilterItemSettingsEditor: FC<IFilterItemSettingsEditorProps> = ({ value, onChange, readOnly }) => {
  const metadata = useMetadata(false);

  const { expression, ...filterProps } = value;

  const onChangeExpression = (newValue): void => {
    onChange({ ...value, expression: newValue });
  };
  const onChangeProps = (newValue): void => {
    onChange({ ...value, ...newValue });
  };

  return (
    <ListEditorRenderer
      sidebarProps={{
        title: 'Properties',
        content: <FilterItemProperties value={filterProps} onChange={onChangeProps} readOnly={readOnly} />,
      }}
    >
      <QueryBuilderProvider metadata={metadata?.metadata}>
        <Tabs
          defaultActiveKey="queryBuilderConfigureTab"
          destroyOnHidden
          items={[
            {
              key: 'queryBuilderConfigureTab',
              label: 'Query builder',
              children: <QueryBuilderPlainRenderer onChange={onChangeExpression} value={expression} readOnly={readOnly} />,
            },
            {
              key: 'expressionViewerTab',
              label: 'Query expression viewer',
              children: <QueryBuilderExpressionViewer value={value?.expression} />,
            },
            {
              key: 'exposedVariables',
              label: 'Variables',
              children: (
                <CodeVariablesTables
                  data={[
                    {
                      id: '61955479-c9fd-4613-b639-d2be14795245',
                      name: 'data',
                      description: 'The state of the form',
                      type: 'object',
                    },
                    {
                      id: 'e27dd783-c204-4b53-a6a0-babe4cb46e39',
                      name: 'globalState',
                      description: 'The global state',
                      type: 'object',
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </QueryBuilderProvider>
    </ListEditorRenderer>
  );
};
