import { IToolboxComponent } from '@/interfaces';
import { executeScriptSync, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { HighlightOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import React from 'react';
import { IHtmlComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { ConfigurableFormItem } from '@/components';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { addContextData } from '@/index';

interface IHtmlComponentCalulatedModel {
  getContent: (value: any) => string;
}

const HtmlComponent: IToolboxComponent<IHtmlComponentProps, IHtmlComponentCalulatedModel> = {
  type: 'htmlRender',
  name: 'HTML Render',
  icon: <HighlightOutlined />,
  isInput: false,
  isOutput: true,
  calculateModel: (model, allData) => ({
    getContent: (value: any) => model.renderer
      ? executeScriptSync(model.renderer, addContextData(allData, {value})) || '<div><div/>'
      : '<div><div/>'
  }),
  Factory: ({ model, calculatedModel }) => {
    return <div style={model.allStyles.fullStyle}>
      <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
        {value => parse(calculatedModel.getContent(value))}
      </ConfigurableFormItem>
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
