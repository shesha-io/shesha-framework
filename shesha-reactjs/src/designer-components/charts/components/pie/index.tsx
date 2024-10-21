import {
  ArcElement, CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Decimation,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController, LineElement,
  PieController,
  PointElement,
  RadialLinearScale,
  Title, Tooltip,
} from 'chart.js';
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { IChartData, IChartDataProps } from '../../model';

interface IPieChartProps extends IChartDataProps {
  data: IChartData;
}

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  DoughnutController,
  PieController,
  RadialLinearScale,
  Decimation,
  Filler,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Legend,
);

const PieChart = ({ data }: IPieChartProps) => {
  const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showXAxisScale, showTitle, title, legendPosition } = useChartDataStateContext();

  const options: ChartOptions<any> = {
    responsive: true,
    plugins: {
      legend: {
        display: showXAxisScale,
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