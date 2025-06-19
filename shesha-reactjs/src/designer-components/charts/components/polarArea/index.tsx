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

  return <PolarArea data={data as any} options={options} />;
};

export default PolarAreaChart;
