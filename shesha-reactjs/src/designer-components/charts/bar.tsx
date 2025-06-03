import { ConfigurableFormItem } from '@/components';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces';
import { BarChartOutlined } from '@ant-design/icons';
import React from 'react';
import ChartDataProvider from '../../providers/chartData';
import ChartControl from './chartControl';
import ChartControlURL from './chartControlURL';
import { IChartProps } from './model';
import { getSettings } from './settingsFormIndividual';

const BarChartComponent: IToolboxComponent<IChartProps> = {
  type: 'barChart',
  name: 'Bar Chart',
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
              {model.dataMode === 'url' ? <ChartControlURL {...model} /> : <ChartControl {...model} chartType='bar' />}
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
      chartType: 'bar',
      showTitle: false,
      showLegend: true,
      legendPosition: 'top',
      hidden: false,
      ...prev,
     }))
    .add<IChartProps>(1, prev => ({ ...prev, hideLabel: true }))
    .add<IChartProps>(2, prev => ({ ...prev, showBorder: true }))
    .add<IChartProps>(3, prev => ({ ...prev, isDoughnut: false }))
    .add<IChartProps>(4, prev => ({ ...prev, showLegend: false, showTitle: true }))
};

export default BarChartComponent;
