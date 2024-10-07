import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
} from 'chart.js';
import { IChartData, IChartDataProps } from '../../model';
import { useChartDataStateContext } from '../../../../providers/chartData';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface IPieChartProps extends IChartDataProps {
  data: IChartData;
}

const PieChart = ({ data }: IPieChartProps) => {
  const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showLegend, showTitle, title, legendPosition } = useChartDataStateContext();

  const options: ChartOptions<any> = {
    responsive: true,
    plugins: {
      legend: {
        display: showLegend,
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

  return <Pie data={data as any} options={options} />;
};

export default PieChart;