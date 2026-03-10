import { CodeOutlined } from '@ant-design/icons';
import React from 'react';
import { FormMarkup } from '@/providers/form/models';
import { ConfigurableFormItem } from '@/components';
import settingsFormJson from './settingsForm.json';
import { ThreeStateSwitchComponentDefinition } from './interfaces';
import ThreeStateSwitch from '@/components/threeStateSwitch';

const settingsForm = settingsFormJson as FormMarkup;

const ThreeStateSwitchComponent: ThreeStateSwitchComponentDefinition = {
  type: 'threeStateSwitch',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Edit mode Selector',
  icon: <CodeOutlined />,
  Factory: ({ model }) => {
    return <ConfigurableFormItem model={model}><ThreeStateSwitch readOnly={model.readOnly} /></ConfigurableFormItem>;
  },
  settingsFormMarkup: settingsForm,
};

export default ThreeStateSwitchComponent;
