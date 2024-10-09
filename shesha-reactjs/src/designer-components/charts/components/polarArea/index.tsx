import React from 'react';
import { PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ChartOptions,
  Title, Tooltip, Legend, ArcElement, RadialLinearScale,
} from 'chart.js';
import { IChartData, IChartDataProps } from '../../model';
import { useChartDataStateContext } from '../../../../providers/chartData';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
);

interface IPolarAreaChartProps extends IChartDataProps {
  data: IChartData;
}

const PolarAreaChart = ({ data }: IPolarAreaChartProps) => {
  const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showXAxisLabel, showTitle, title, legendPosition } = useChartDataStateContext();

  const options: ChartOptions<any> = {
    responsive: true,
    plugins: {
      legend: {
        display: showXAxisLabel,
        position: legendPosition ?? 'top',
      },
      title: {
        display: showTitle,
        text: title || `${yProperty} by ${xProperty} (${aggregationMethod})`,
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
  };

  return <PolarArea data={data as any} options={options} />;
};

export default PolarAreaChart;
