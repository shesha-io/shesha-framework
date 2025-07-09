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
import { splitTitleIntoLines, createFontConfig } from '../../utils';

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
  const { showLegend, showTitle, legendPosition, isDoughnut, strokeColor, strokeWidth, dataMode, titleFont, legendFont } = useChartDataStateContext();

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
    maintainAspectRatio: false, // Allow the chart to fill available space
    aspectRatio: 1, // Square aspect ratio for pie charts
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    transitions: {
      active: {
        animation: {
          duration: 400, // Quick animation for hover effects
        },
      },
      resize: {
        animation: {
          duration: 800, // Smooth resize animation
        },
      },
    },
    plugins: {
      legend: {
        display: !!showLegend,
        position: legendPosition ?? 'top',
        align: 'center',
        fullSize: false, // This ensures legend doesn't consume chart space
        labels: {
          boxWidth: 20,
          padding: 10,
          font: createFontConfig(legendFont, 12, '400'),
          color: legendFont?.color || '#000000',
        },
      },
      title: {
        display: !!(showTitle && chartTitle?.length > 0),
        text: splitTitleIntoLines(chartTitle),
        font: createFontConfig(titleFont, 16, 'bold'),
        color: titleFont?.color || '#000000',
        align: 'center',
        fullSize: false, // This ensures title doesn't consume chart space
      },
    },
  };

  return isDoughnut ? <Doughnut data={data as any} options={options} /> : <Pie data={data as any} options={options} />;
};

export default PieChart;
