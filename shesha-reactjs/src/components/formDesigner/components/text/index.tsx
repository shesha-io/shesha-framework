import { LineHeightOutlined } from '@ant-design/icons';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../formDesignerUtils';
import { IToolboxComponent } from '../../../../interfaces/formDesigner';
import { ITextTypographyProps } from './models';
import { settingsFormMarkup } from './settings';
import TypographyComponent from './typography';

const TextComponent: IToolboxComponent<ITextTypographyProps> = {
  type: 'text',
  name: 'Text',
  icon: <LineHeightOutlined />,
  tooltip: 'Complete Typography component that combines Text, Paragraph and Title',
  factory: model => <TypographyComponent {...model} />,
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
};

export default TextComponent;
