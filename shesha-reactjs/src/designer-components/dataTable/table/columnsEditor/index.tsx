import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IToolboxComponent } from '@/interfaces';
import { IColumnsEditorComponentProps } from './interfaces';
import { ColumnsConfig } from './columnsConfig';
import { MetadataProvider, useForm } from '@/providers';
import { evaluateString } from '@/providers/form/utils';
import ConditionalWrap from '@/components/conditionalWrapper';

/**
 * This component allows the user to configure columns on the settings form
 *
 * However, it's not meant to be visible for users to drag and drop into the form designer
 */
export const ColumnsEditorComponent: IToolboxComponent<IColumnsEditorComponentProps> = {
  type: 'columnsEditorComponent',
  name: 'Columns Editor Component',
  icon: <ColumnWidthOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: ({ model }) => {
    const { formData } = useForm();
    const { modelType: modelTypeExpression } = model;
    const modelType = modelTypeExpression ? evaluateString(modelTypeExpression, { data: formData }) : undefined;

    return (
      <ConditionalWrap
        condition={Boolean(modelType)}
        wrap={(children) => <MetadataProvider modelType={modelType}>{children}</MetadataProvider>}
      >
        <ConfigurableFormItem model={model}>
          <ColumnsConfig />
        </ConfigurableFormItem>
      </ConditionalWrap>
    );
  },
  initModel: (model: IColumnsEditorComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
};
