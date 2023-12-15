import { CodeOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import ReadOnlyModeSelector from '@/components/readOnlyModeSelector/index';
import { ConfigurableFormItem } from '@/index';

const ReadOnlyModeSelectorComponent: IToolboxComponent<IConfigurableFormComponent> = {
  type: 'readOnlyModeSelector',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Edit mode Selector',
  icon: <CodeOutlined />,
  isHidden: true,
  Factory: ({ model }) => {
    return <ConfigurableFormItem model={model}><ReadOnlyModeSelector readOnly={model.readOnly}/></ConfigurableFormItem>;
  }
};

export default ReadOnlyModeSelectorComponent;
