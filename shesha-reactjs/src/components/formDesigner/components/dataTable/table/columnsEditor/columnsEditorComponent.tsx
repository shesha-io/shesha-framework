import { ColumnWidthOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC, Fragment, useState } from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '../../../../../../interfaces';
import { ColumnsItemProps } from '../../../../../../providers/datatableColumnsConfigurator/models';
import { ITableComponentBaseProps } from '../models';
import { ColumnsEditorModal } from './columnsEditorModal';
import ConfigurableFormItem from '../../../formItem';

export interface IColumnsEditorComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {
  items: ColumnsItemProps[];
}

/**
 * This component allows the user to configure columns on the settings form
 *
 * However, it's not meant to be visible for users to drag and drop into the form designer
 */
const ColumnsEditorComponent: IToolboxComponent<IColumnsEditorComponentProps> = {
  type: 'columnsEditorComponent',
  name: 'Columns Editor Component',
  icon: <ColumnWidthOutlined />,
  isHidden: true, // We do not want to show this on the component toolbox
  factory: (model: IColumnsEditorComponentProps) => {
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

interface IColumnsConfigProps {
  value?: ColumnsItemProps[];
  onChange?: (value: ColumnsItemProps[]) => void;
}

const ColumnsConfig: FC<IColumnsConfigProps> = ({ value, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModalVisibility = () => setModalVisible(prev => !prev);

  return (
    <Fragment>
      <Button onClick={toggleModalVisibility}>Configure Columns</Button>

      <ColumnsEditorModal
        visible={modalVisible}
        hideModal={toggleModalVisibility}
        value={value}
        onChange={onChange}
        readOnly={false}
      />
    </Fragment>
  );
};

export default ColumnsEditorComponent;
