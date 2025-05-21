import { ConfigurableFormItem } from '@/components';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces';
import { BarChartOutlined } from '@ant-design/icons';
import React from 'react';
import ChartDataProvider from '../../providers/chartData';
import ChartControl from './chartControl';
import ChartControlURL from './chartControlURL';
import { IChartProps } from './model';
import { getSettings } from './settingsForm';

const ChartComponent: IToolboxComponent<IChartProps> = {
  type: 'chart',
  name: 'Chart',
  isInput: false,
  isOutput: true,
  icon: <BarChartOutlined />,
  Factory: ({ model }) => {
    if (model.hidden) return null;
    
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
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IChartProps>(0, prev => ({ 
      chartType: 'line',
      showTitle: false,
      showLegend: false,
      legendPosition: 'top',
      hidden: false,
      ...prev,
     }))
    .add<IChartProps>(1, prev => ({ ...prev, hideLabel: true }))
    .add<IChartProps>(2, prev => ({ ...prev, showBorder: true }))
    .add<IChartProps>(3, prev => ({ ...prev, isDoughnut: false }))
};

export default ChartComponent;
