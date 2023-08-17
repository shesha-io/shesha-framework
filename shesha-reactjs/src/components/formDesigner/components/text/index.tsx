import { LineHeightOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../formDesignerUtils';
import { IToolboxComponent } from '../../../../interfaces/formDesigner';
import ConfigurableFormItem from '../formItem';
import { ITextTypographyProps } from './models';
import { settingsFormMarkup } from './settings';
import TypographyComponent from './typography';

const TextComponent: IToolboxComponent<ITextTypographyProps> = {
  type: 'text',
  name: 'Text',
  icon: <LineHeightOutlined />,
  tooltip: 'Complete Typography component that combines Text, Paragraph and Title',
  factory: model => (
    <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
      {(value) => <TypographyComponent {...model} value={model?.contentDisplay === 'name' ? value : model?.content}/>}
    </ConfigurableFormItem>
  ),
  settingsFormMarkup,
  validateSettings: model => validateConfigurableComponentSettings(settingsFormMarkup, model),
  initModel: model => ({
    code: false,
    copyable: false,
    delete: false,
    disabled: false,
    ellipsis: false,
    mark: false,
    italic: false,
    underline: false,
    level: 1,
    textType: 'span',
    ...model,
  }),
  migrator: (m) => m
    .add<ITextTypographyProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as ITextTypographyProps)
  ,
};

export default TextComponent;
