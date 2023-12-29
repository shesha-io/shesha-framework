import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React, { FC, Fragment, useState } from 'react';
import { Button } from 'antd';
import { ColumnsEditorModal } from './columnsEditorModal';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { ColumnWidthOutlined } from '@ant-design/icons';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { ITableComponentBaseProps } from '../models';

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
  isHidden: true, // We do not want to show this on the component toolbox
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

interface IColumnsConfigProps {
  value?: ColumnsItemProps[];
  onChange?: (value: ColumnsItemProps[]) => void;
  readOnly: boolean;
}

const ColumnsConfig: FC<IColumnsConfigProps> = ({ value, onChange, readOnly }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModalVisibility = () => setModalVisible((prev) => !prev);

  return (
    <Fragment>
      <Button onClick={toggleModalVisibility}>Configure Columns</Button>

      <ColumnsEditorModal
        visible={modalVisible}
        hideModal={toggleModalVisibility}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </Fragment>
  );
};

export default EntityPickerColumnsEditorComponent;
