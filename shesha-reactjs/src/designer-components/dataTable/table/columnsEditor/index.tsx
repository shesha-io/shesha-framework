import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IToolboxComponent } from '@/interfaces';
import { IColumnsEditorComponentProps } from './interfaces';
import { ColumnsConfig } from './columnsConfig';

/**
 * This component allows the user to configure columns on the settings form
 *
 * However, it's not meant to be visible for users to drag and drop into the form designer
 */
const ColumnsEditorComponent: IToolboxComponent<IColumnsEditorComponentProps> = {
  type: 'columnsEditorComponent',
  name: 'Columns Editor Component',
  icon: <ColumnWidthOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        <ColumnsConfig />
      </ConfigurableFormItem>
    );
  },
  initModel: (model: IColumnsEditorComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
};

export default ColumnsEditorComponent;
