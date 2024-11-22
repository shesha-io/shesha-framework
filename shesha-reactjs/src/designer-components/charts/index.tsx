import { BarChartOutlined } from '@ant-design/icons';
import React from 'react';
import { settingsForm } from './settings';
import { IChartProps } from './model';
import ChartControl from './chartControl';
import ChartDataProvider from '../../providers/chartData';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import ChartControlURL from './chartControlURL';
import { ConfigurableFormItem } from '@/components';

const ChartComponent: IToolboxComponent<IChartProps> = {
  type: 'chart',
  name: 'Chart',
  isInput: false,
  isOutput: true,
  icon: <BarChartOutlined />,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        {() => {
          return (
            <ChartDataProvider>
              {model.dataMode === 'url' ? <ChartControlURL {...model} /> : <ChartControl {...model} />}
            </ChartDataProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => ({
    chartType: 'line', showTitle: false, showLegend: true, legendPosition: 'top', ...model
  }),
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IChartProps>(0, prev => ({ ...prev, hideLabel: true }))
    .add<IChartProps>(1, prev => ({...prev, showBorder: true}))
};

export default ChartComponent;
