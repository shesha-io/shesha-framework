import { ArcElement, Chart as ChartJS, ChartOptions, Legend, RadialLinearScale, Title, Tooltip } from 'chart.js';
import React from 'react';
import { PolarArea } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { IChartData, IChartDataProps } from '../../model';
import { useGeneratedTitle } from '../../hooks';
import { splitTitleIntoLines } from '../../utils';

interface IPolarAreaChartProps extends IChartDataProps {
  data: IChartData;
}

ChartJS.register(Title, Tooltip, Legend, ArcElement, RadialLinearScale);

const PolarAreaChart = ({ data }: IPolarAreaChartProps) => {
  const { showTitle, legendPosition, showLegend, strokeColor, dataMode, strokeWidth } = useChartDataStateContext();

  const chartTitle: string = useGeneratedTitle();

  data.datasets.forEach((dataset: { data: any[] }) => {
    dataset.data = dataset?.data?.map((item) => item ?? 'undefined');
  });

  if (dataMode === 'url') {
    data?.datasets?.map((dataset: any) => {
      dataset.borderColor = strokeColor || 'black';
      dataset.borderWidth = typeof strokeWidth === 'number' || strokeWidth > 1 ? strokeWidth : 1;
      dataset.strokeColor = strokeColor || 'black';
      return dataset;
    });
  }

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: true, // Maintain aspect ratio to prevent overflow
    aspectRatio: 1, // Square aspect ratio for polar area charts
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    animation: {
      duration: 1400, // Animation duration in milliseconds
      easing: 'easeInOutCubic', // Smooth easing function for polar areas
      delay: (context) => context.dataIndex * 80, // Staggered animation for polar areas
    },
    transitions: {
      active: {
        animation: {
          duration: 350, // Quick animation for hover effects
        },
      },
      resize: {
        animation: {
          duration: 700, // Smooth resize animation
        },
      },
    },
    plugins: {
      scales: {
        r: {
          ticks: {
            color: 'green',
            font: {
              size: 14, // Make ticks larger for better visibility
            },
            backdropColor: 'rgba(255, 255, 255, 0)', // Remove the tick's backdrop
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.2)', // Make grid lines more transparent
          },
        },
      },
      legend: {
        display: !!showLegend,
        position: legendPosition ?? 'top',
        align: 'center',
        fullSize: false, // This ensures legend doesn't consume chart space
        labels: {
          boxWidth: 20,
          padding: 10,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !!(showTitle && chartTitle?.length > 0),
        text: splitTitleIntoLines(chartTitle),
        font: {
          size: 16,
          weight: 'bold',
        },
        align: 'center',
        fullSize: false, // This ensures title doesn't consume chart space
      },
    },
  };

  return <PolarArea data={data as any} options={options} />;
};

export default PolarAreaChart;
