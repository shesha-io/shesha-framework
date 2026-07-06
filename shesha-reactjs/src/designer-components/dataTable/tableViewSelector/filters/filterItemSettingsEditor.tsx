import { ListEditorRenderer } from '@/components/listEditorRenderer';
import QueryBuilderExpressionViewer from '@/designer-components/queryBuilder/queryBuilderExpressionViewer';
import { QueryBuilderPlainRenderer } from '@/designer-components/queryBuilder/queryBuilderFieldPlain';
import { QueryBuilderProvider, useMetadataOrUndefined } from '@/providers';
import { Tabs } from 'antd';
import React, { FC, useMemo } from 'react';
import { BaseFilterProperties, FilterItemProperties } from './filterItemProperties';
import { IStoredFilter } from '@/interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';

export interface IFilterItemSettingsEditorProps {
  value: IStoredFilter;
  onChange: (newValue: IStoredFilter) => void;
  readOnly: boolean;
}


export const FilterItemSettingsEditor: FC<IFilterItemSettingsEditorProps> = ({ value, onChange, readOnly }) => {
  const metadataContext = useMetadataOrUndefined();
  const metadata = metadataContext?.metadata;

  const { expression, ...filterProps } = value;
  const expressionObject = useMemo<JsonLogicFilter | undefined>(() => {
    if (!isDefined(expression) || (typeof (expression) === 'string' && isNullOrWhiteSpace(expression)))
      return undefined;

    return (typeof (expression) === 'string'
      ? JSON.parse(expression)
      : expression) as JsonLogicFilter;
  }, [expression]);

  const onChangeExpression = (newValue: JsonLogicFilter | null): void => {
    onChange({ ...value, expression: newValue ?? undefined });
  };
  const onChangeProps = (newValue: BaseFilterProperties): void => {
    onChange({ ...value, ...newValue });
  };

  return (
    <ListEditorRenderer
      sidebarProps={{
        title: 'Properties',
        content: <FilterItemProperties value={filterProps} onChange={onChangeProps} readOnly={readOnly} />,
      }}
    >

      <Tabs
        defaultActiveKey="queryBuilderConfigureTab"
        destroyOnHidden
        items={[
          {
            key: 'queryBuilderConfigureTab',
            label: 'Query builder',
            children: metadata
              ? (
                <QueryBuilderProvider metadata={metadata}>
                  <QueryBuilderPlainRenderer onChange={onChangeExpression} value={expressionObject} readOnly={readOnly} />
                </QueryBuilderProvider>
              )
              : undefined,
          },
          {
            key: 'expressionViewerTab',
            label: 'Query expression viewer',
            children: <QueryBuilderExpressionViewer value={expressionObject} />,
          },
        ]}
      />

    </ListEditorRenderer>
  );
};
