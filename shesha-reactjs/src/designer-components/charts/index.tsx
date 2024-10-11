import { BarChartOutlined } from '@ant-design/icons';
import React from 'react';
import { settingsForm } from './settings';
import { IChartProps } from './model';
import ChartControl from './chartControl';
import ChartDataProvider from '../../providers/chartData';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';

const ChartComponent: IToolboxComponent<IChartProps> = {
  type: 'chart',
  name: 'Chart',
  isInput: false,
  icon: <BarChartOutlined />,
  Factory: ({ model }) => {
    if (model.hidden) return null;

    return (
      <ChartDataProvider>
        <ChartControl {...model} />
      </ChartDataProvider>
    );
  },
  initModel: (model) => ({
    chartType: 'line', showTitle: false, showLegend: true, legendPosition: 'top', ...model
  }),
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default ChartComponent;
