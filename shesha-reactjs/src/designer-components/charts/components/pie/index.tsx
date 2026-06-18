import {
  ArcElement,
  CategoryScale,
  Chart,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Color,
  Decimation,
  DoughnutController,
  Filler,
  Legend,
  LegendItem,
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
import { useGeneratedTitle } from '../../hooks/hooks';
import { splitTitleIntoLines, createFontConfig } from '../../utils';
import { isNonEmptyArray } from '@/utils/array';
import { isNullOrWhiteSpace } from '@/utils/nullables';

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

const PieChart = ({ data }: IPieChartProps): React.JSX.Element => {
  const { showLegend, showTitle, legendPosition, isDoughnut, strokeColor, strokeWidth, dataMode, titleFont, legendFont } = useChartDataStateContext();

  const chartTitle: string = useGeneratedTitle();

  data.datasets.forEach((dataset) => {
    dataset.data = dataset.data?.map((item) => item ?? 'undefined');
  });

  if (dataMode === 'url') {
    data.datasets.forEach((dataset) => {
      dataset.borderColor = strokeColor || 'black';
      dataset.borderWidth = typeof strokeWidth === 'number' ? strokeWidth : 0;
      dataset.strokeColor = strokeColor || 'black';
    });
  }

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to fill available space
    aspectRatio: 1, // Square aspect ratio for pie charts
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
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
        display: showLegend === true,
        position: legendPosition ?? 'top',
        align: (legendPosition === 'left' || legendPosition === 'right') ? 'center' : 'center',
        fullSize: false, // This ensures legend doesn't consume chart space
        labels: {
          boxWidth: 20,
          padding: 10,
          font: createFontConfig(legendFont, 12, 400),
          color: legendFont?.color || '#000000',
          usePointStyle: true, // Use point style for better visual consistency
          generateLabels: function (chart: Chart): LegendItem[] {
            const data = chart.data;
            if (data.labels && data.labels.length && isNonEmptyArray(data.datasets)) {
              const dataset = data.datasets[0];
              return data.labels.map<LegendItem>((label, i) => {
                // backgroundColor can be an array or a single value
                const bgColor = dataset.backgroundColor;
                return {
                  text: String(label), // Ensure label is a string
                  fillStyle: (bgColor || dataset.borderColor || '#000000') as Color,
                  strokeStyle: (dataset.borderColor || '#000000') as Color,
                  lineWidth: (dataset.borderWidth || 1) as number,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i,
                  fontColor: legendFont?.color || '#000000',
                } satisfies LegendItem;
              });
            }
            return [];
          },
        },
      },
      title: {
        display: showTitle && !isNullOrWhiteSpace(chartTitle),
        text: splitTitleIntoLines(chartTitle),
        font: createFontConfig(titleFont, 16, 'bold'),
        color: titleFont?.color || '#000000',
        align: 'center',
        fullSize: false, // This ensures title doesn't consume chart space
      },
    },
  };

  return isDoughnut
    ? <Doughnut data={data as ChartData<"doughnut">} options={options as ChartOptions<"doughnut">} />
    : <Pie data={data as ChartData<"pie">} options={options as ChartOptions<"pie">} />;
};

export default PieChart;
