import { CodeOutlined } from '@ant-design/icons';
import React from 'react';
import { FormMarkup } from '@/providers/form/models';
import EditModeSelector from '@/components/editModeSelector/index';
import { ConfigurableFormItem } from '@/components';
import settingsFormJson from './settingsForm.json';
import { EditModeSelectorComponentDefinition } from './interfaces';
const settingsForm = settingsFormJson as FormMarkup;

const EditModeSelectorComponent: EditModeSelectorComponentDefinition = {
  type: 'editModeSelector',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Edit mode Selector',
  icon: <CodeOutlined />,
  Factory: ({ model }) => {
    return <ConfigurableFormItem model={model}><EditModeSelector readOnly={model.readOnly} /></ConfigurableFormItem>;
  },
  settingsFormMarkup: settingsForm,
};

export default EditModeSelectorComponent;
