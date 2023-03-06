import { LineHeightOutlined } from '@ant-design/icons';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../formDesignerUtils';
import { IToolboxComponent } from '../../../../interfaces/formDesigner';
import ConditionalWrap from '../../../conditionalWrapper';
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
    <ConditionalWrap
      condition={model?.contentDisplay === 'name'}
      wrap={children => <ConfigurableFormItem model={{ ...model, hideLabel: true }}>{children}</ConfigurableFormItem>}
    >
      <TypographyComponent {...model} />
    </ConditionalWrap>
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
};

export default TextComponent;
