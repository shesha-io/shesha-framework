import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { useGeneratedTitle } from '../../hooks';
import { IChartData, IChartDataProps } from '../../model';
import { splitTitleIntoLines } from '../../utils';

interface BarChartProps extends IChartDataProps {
  data: IChartData;
}

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const {
    axisProperty: xProperty,
    valueProperty: yProperty,
    aggregationMethod,
    showLegend,
    showTitle,
    legendPosition,
    showXAxisScale,
    showXAxisTitle,
    showYAxisScale,
    showYAxisTitle,
    stacked,
    dataMode,
    strokeColor,
    strokeWidth,
  } = useChartDataStateContext();

  const chartTitle: string = useGeneratedTitle();

  if (dataMode === 'url') {
    data.datasets = data?.datasets?.map((dataset: any) => ({
      ...dataset,
      data: dataset?.data?.map((item) => item ?? 'undefined'),
      borderColor: strokeColor || 'black',
      borderWidth: typeof strokeWidth === 'number' ? strokeWidth : 0,
    }));
  }

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: true, // Maintain aspect ratio to prevent overflow
    aspectRatio: 2, // Width to height ratio (2:1)
    animation: {
      duration: 1000, // Animation duration in milliseconds
      easing: 'easeInOutQuart', // Smooth easing function
      delay: (context) => context.dataIndex * 50, // Staggered animation for bars
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
    scales: {
      x: {
        title: {
          display: !!(showXAxisTitle && xProperty?.trim().length > 0),
          text: xProperty?.trim() ?? '',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        display: !!showXAxisScale,
        stacked: stacked,
        offset: true, // Ensure the x-axis does not coincide with the y-axis
        beginAtZero: false,
      },
      y: {
        title: {
          display: !!(showYAxisTitle && yProperty?.trim().length > 0),
          text: dataMode === 'url' || !aggregationMethod
            ? yProperty?.trim() ?? ''
            : `${yProperty?.trim() ?? ''} (${aggregationMethod})`,
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        display: !!showYAxisScale,
        stacked: stacked,
      },
    },
  };

  return <Bar data={data as any} options={options} />;
};

export default BarChart;
