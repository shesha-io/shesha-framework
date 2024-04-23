import { IToolboxComponent } from '@/interfaces';
import { executeScriptSync, useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { HighlightOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import React from 'react';
import { IHtmlComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { ConfigurableFormItem } from '@/components';

const HtmlComponent: IToolboxComponent<IHtmlComponentProps> = {
  type: 'htmlRender',
  name: 'HTML Render',
  icon: <HighlightOutlined />,
  isInput: true,
  Factory: ({ model }) => {
    const  ctx = useAvailableConstantsData();    
    return <ConfigurableFormItem model={{...model, hideLabel: true}}>
      {(value) => {
          return parse(model?.renderer
          ? executeScriptSync(model?.renderer, { ...ctx, value }) || '<div><div/>'
          : '<div><div/>');
      }
    }</ConfigurableFormItem>;
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default HtmlComponent;
