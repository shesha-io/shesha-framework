import { IToolboxComponent } from '@/interfaces';
import { executeScriptSync, getStyle, useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { HighlightOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import React from 'react';
import { IHtmlComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { ConfigurableFormItem } from '@/components';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const HtmlComponent: IToolboxComponent<IHtmlComponentProps> = {
  type: 'htmlRender',
  name: 'HTML Render',
  icon: <HighlightOutlined />,
  isInput: false,
  isOutput: true,
  Factory: ({ model }) => {
    const ctx = useAvailableConstantsData();
    const jsStyle = getStyle(model.style, model);
    return <div style={jsStyle}>
      <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
        {(value) => {
          return parse(model?.renderer
            ? executeScriptSync(model?.renderer, { ...ctx, value }) || '<div><div/>'
            : '<div><div/>');
        }
        }</ConfigurableFormItem>
    </div>;
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IHtmlComponentProps>(1, (prev: IHtmlComponentProps) => ({
      ...migrateFormApi.properties(prev),
      renderer: migrateFormApi.withoutFormData(prev.renderer),
    }))
  ,
};

export default HtmlComponent;
