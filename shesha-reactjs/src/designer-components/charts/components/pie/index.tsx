import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Decimation,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { IChartData, IChartDataProps } from '../../model';
import { useGeneratedTitle } from '../../hooks';
import { splitTitleIntoLines } from '../../utils';

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
  Legend
);

const PieChart = ({ data }: IPieChartProps) => {
  const { showLegend, showTitle, legendPosition, isDoughnut, strokeColor, strokeWidth, dataMode } = useChartDataStateContext();

  const chartTitle: string = useGeneratedTitle();

  data.datasets.forEach((dataset: { data: any[] }) => {
    dataset.data = dataset?.data?.map((item) => item ?? 'undefined');
  });

  if (dataMode === 'url') {
    data?.datasets?.map((dataset: any) => {
      dataset.borderColor = strokeColor || 'black';
      dataset.borderWidth = typeof strokeWidth === 'number' ? strokeWidth : 0;
      dataset.strokeColor = strokeColor || 'black';
      return dataset;
    });
  }

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: true, // Maintain aspect ratio to prevent overflow
    aspectRatio: 1, // Square aspect ratio for pie charts
    plugins: {
      legend: {
        display: !!showLegend,
        position: legendPosition ?? 'top',
      },
      title: {
        display: !!(showTitle && chartTitle?.length > 0),
        text: splitTitleIntoLines(chartTitle),
        font: {
          size: 16,
          weight: 'bold',
        },
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

  return isDoughnut ? <Doughnut data={data as any} options={options} /> : <Pie data={data as any} options={options} />;
};

export default PieChart;
