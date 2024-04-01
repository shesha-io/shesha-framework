import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { ColumnWidthOutlined } from '@ant-design/icons';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { ITableComponentBaseProps } from '../models';
import { ColumnsConfig } from './columnsConfig';

interface IColumnsEditorComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {
  //items: ColumnsItemProps[];
}

/**
 * This component allows the user to configure columns on the settings form
 *
 * However, it's not meant to be visible for users to drag and drop into the form designer
 */
const EntityPickerColumnsEditorComponent: IToolboxComponent<IColumnsEditorComponentProps> = {
  type: 'entityPickerColumnsEditorComponent',
  name: 'EntityPicker Columns Editor Component',
  icon: <ColumnWidthOutlined />,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        <ColumnsConfig readOnly={model.readOnly} />
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

export default EntityPickerColumnsEditorComponent;
