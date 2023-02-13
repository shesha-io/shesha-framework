import { EditOutlined } from '@ant-design/icons';
import React from 'react';
import { FormMarkup } from '../../../../providers/form/models';
import settingsFormJson from './settingsForm.json';
import { IToolboxComponent } from '../../../../interfaces';
import { validateConfigurableComponentSettings } from '../../../../formDesignerUtils';

import { IMarkdownProps } from './interfaces';
import Markdown from './markdown';

const settingsForm = settingsFormJson as FormMarkup;

const MarkdownComponent: IToolboxComponent<IMarkdownProps> = {
  type: 'markdown',
  name: 'Markdown',
  icon: <EditOutlined />,
  factory: (model: IMarkdownProps) => {
    return <Markdown {...model} />;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => ({
    ...model,
  }),
};

export default MarkdownComponent;
