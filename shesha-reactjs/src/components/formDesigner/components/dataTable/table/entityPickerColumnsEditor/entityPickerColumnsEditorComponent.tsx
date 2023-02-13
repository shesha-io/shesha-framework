import { ColumnWidthOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC, Fragment, useState } from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '../../../../../../interfaces';
import { ColumnsItemProps } from '../../../../../../providers/datatableColumnsConfigurator/models';
import { ITableComponentBaseProps } from '../models';
import { ColumnsEditorModal } from './columnsEditorModal';
import ConfigurableFormItem from '../../../formItem';
import { useForm } from '../../../../../..';

interface IColumnsEditorComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {
  items: ColumnsItemProps[];
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
  isHidden: true, // We do not want to show this on the component toolbox
  factory: (model: IColumnsEditorComponentProps) => {
    const { formMode } = useForm();
    return (
      <ConfigurableFormItem model={model}>
        <ColumnsConfig readOnly={formMode === 'readonly'}/>
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

interface IColumnsConfigProps {
  value?: ColumnsItemProps[];
  onChange?: (value: ColumnsItemProps[]) => void;
  readOnly: boolean;
}

const ColumnsConfig: FC<IColumnsConfigProps> = ({ value, onChange, readOnly }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModalVisibility = () => setModalVisible(prev => !prev);

  return (
    <Fragment>
      <Button onClick={toggleModalVisibility}>Configure Columns</Button>

      <ColumnsEditorModal visible={modalVisible} hideModal={toggleModalVisibility} value={value} onChange={onChange} readOnly={readOnly}/>
    </Fragment>
  );
};

export default EntityPickerColumnsEditorComponent;
