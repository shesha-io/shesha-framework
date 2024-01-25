import { CodeOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import EditModeSelector from '@/components/editModeSelector/index';
import { ConfigurableFormItem } from '@/components';

const EditModeSelectorComponent: IToolboxComponent<IConfigurableFormComponent> = {
  type: 'editModeSelector',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Edit mode Selector',
  icon: <CodeOutlined />,
  isHidden: true,
  Factory: ({ model }) => {
    return <ConfigurableFormItem model={model}><EditModeSelector readOnly={model.readOnly}/></ConfigurableFormItem>;
  }
};

export default EditModeSelectorComponent;
