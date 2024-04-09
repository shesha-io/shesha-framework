import React from 'react';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import {  IToolboxComponent } from '@/interfaces/formDesigner';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { ConfigurableFormItem } from '@/index';
import settingsFormMarkup from './settings.json';
import { LineHeightOutlined } from '@ant-design/icons';
import MaskedText from '@/components/maskedText';

export interface IMaskedTextComponetProps extends IConfigurableFormComponent {
    startMask: number;
    endMask: number;
}

const settingsForm = settingsFormMarkup as FormMarkup;

const MaskedTextComponent: IToolboxComponent<IMaskedTextComponetProps> = {
  type: 'maskedText',
  name: 'MaskedText',
   icon: <LineHeightOutlined />,
  isInput: true,
  tooltip: 'Complete Typography component that combines Text, Paragraph and Title',
  Factory: ({ model }) => (
    <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
      {(value) => <MaskedText {...model} value={value}/>}
    </ConfigurableFormItem>
  ),
   settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => ({
    code: false,
    copyable: false,
    delete: false,
    ellipsis: false,
    mark: false,
    italic: false,
    underline: false,
    level: 1,
    textType: 'span',
    ...model,
  })
};

export default MaskedTextComponent;
