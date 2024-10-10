import React from 'react';
import { PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ChartOptions,
  Title, Tooltip, Legend, ArcElement, RadialLinearScale,
} from 'chart.js';
import { IChartData, IChartDataProps } from '../../model';
import { useChartDataStateContext } from '../../../../providers/chartData';

interface IPolarAreaChartProps extends IChartDataProps {
  data: IChartData;
}

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
);

const PolarAreaChart = ({ data }: IPolarAreaChartProps) => {
  const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showXAxisLabel, showTitle, title, legendPosition } = useChartDataStateContext();

  const options: ChartOptions<any> = {
    responsive: true,
    plugins: {
      scales: {
        r: {
          ticks: {
            color: 'green',
            font: {
              size: 14  // Make ticks larger for better visibility
            },
            backdropColor: 'rgba(255, 255, 255, 0)'  // Remove the tick's backdrop
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.2)'  // Make grid lines more transparent
          }
        }
      },
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
