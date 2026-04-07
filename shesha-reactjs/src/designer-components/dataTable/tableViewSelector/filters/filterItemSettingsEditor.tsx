import { CodeVariablesTables } from '@/components/codeVariablesTable';
import { ListEditorRenderer } from '@/components/listEditorRenderer';
import QueryBuilderExpressionViewer from '@/designer-components/queryBuilder/queryBuilderExpressionViewer';
import { QueryBuilderPlainRenderer } from '@/designer-components/queryBuilder/queryBuilderFieldPlain';
import { QueryBuilderProvider, useMetadata } from '@/providers';
import { Tabs } from 'antd';
import React, { FC, useMemo } from 'react';
import { FilterItemProperties } from './filterItemProperties';
import { IStoredFilter } from '@/interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export interface IFilterItemSettingsEditorProps {
  value?: IStoredFilter;
  onChange: (newValue: IStoredFilter) => void;
  readOnly: boolean;
}

export const FilterItemSettingsEditor: FC<IFilterItemSettingsEditorProps> = ({ value, onChange, readOnly }) => {
  const metadata = useMetadata(false);

  const { expression, ...filterProps } = value;
  const expressionObject = useMemo<object | undefined>(() => {
    if (!isDefined(expression) || (typeof (expression) === 'string' && isNullOrWhiteSpace(expression)))
      return undefined;

    return typeof (expression) === 'string'
      ? JSON.parse(expression)
      : expression;
  }, [expression]);

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
              children: <QueryBuilderPlainRenderer onChange={onChangeExpression} value={expressionObject} readOnly={readOnly} />,
            },
            {
              key: 'expressionViewerTab',
              label: 'Query expression viewer',
              children: <QueryBuilderExpressionViewer value={expressionObject} />,
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
