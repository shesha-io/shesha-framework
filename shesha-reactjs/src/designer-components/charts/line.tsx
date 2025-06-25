import { ConfigurableFormItem } from '@/components';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces';
import { LineChartOutlined } from '@ant-design/icons';
import React from 'react';
import ChartDataProvider from '../../providers/chartData';
import ChartControl from './chartControl';
import ChartControlURL from './chartControlURL';
import { IChartProps } from './model';
import { getSettings } from './settingsFormIndividual';
import { defaultConfigFiller, filterNonNull } from './utils';

const LineChartComponent: IToolboxComponent<IChartProps> = {
  type: 'lineChart',
  name: 'Line Chart',
  isInput: false,
  isOutput: true,
  icon: <LineChartOutlined />,
  Factory: ({ model }) => {
    if (model.hidden) return null;
    
    return (
      <ConfigurableFormItem model={model}>
        {() => {
          return (
            <ChartDataProvider>
              {model.dataMode === 'url' ? <ChartControlURL {...model} /> : <ChartControl {...model} chartType='line' />}
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
      showLegend: true,
      legendPosition: 'top',
      hidden: false,
      ...prev,
     }))
    .add<IChartProps>(1, prev => ({ ...prev, hideLabel: true }))
    .add<IChartProps>(2, prev => ({ ...prev, showBorder: true }))
    .add<IChartProps>(3, prev => ({ ...prev, isDoughnut: false }))
    .add<IChartProps>(4, prev => ({ ...prev, showTitle: true, showLegend: false }))
    .add<IChartProps>(5, prev => ({ 
      ...defaultConfigFiller,
      ...filterNonNull(prev),
      type: prev.type,
      id: prev.id
    }))
    .add<IChartProps>(6, prev => ({ 
      ...prev,
      isAxisTimeSeries: false,
      isGroupingTimeSeries: false,
      showXAxisScale: true,
      showYAxisScale: true,
      showXAxisTitle: true,
      showYAxisTitle: true,
      showXAxisLabel: true,
      showYAxisLabel: true,
      strokeColor: '#000000',
      strokeWidth: 1,
    }))
};

export default LineChartComponent;
