import { EditOutlined } from '@ant-design/icons';
import React from 'react';
import { FormMarkup } from '@/providers/form/models';
import settingsFormJson from './settingsForm.json';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';

import { IMarkdownProps } from './interfaces';
import Markdown from './markdown';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IInputStyles } from '../textField/interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const MarkdownComponent: IToolboxComponent<IMarkdownProps> = {
  type: 'markdown',
  name: 'Markdown',
  icon: <EditOutlined />,
  isInput: false,
  isOutput: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={{...model, label: undefined, hideLabel: true}}   >
        {(value) => {
          const content = model.content || value;
          return <Markdown {...model} content={content}/>;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => ({
    ...model,
  }),
  migrator: (m) => m
   .add<IMarkdownProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IMarkdownProps)
   .add<IMarkdownProps>(1, (prev) => ({...migrateFormApi.properties(prev)}))
   .add<IMarkdownProps>(2, (prev) => {
    const styles: IInputStyles = {
      style: prev.style
    };

    return { ...prev, desktop: {...styles}, tablet: {...styles}, mobile: {...styles} };
  })
  ,
};

export default MarkdownComponent;
