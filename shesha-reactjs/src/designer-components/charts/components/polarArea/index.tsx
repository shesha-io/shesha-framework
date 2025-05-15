import { ArcElement, Chart as ChartJS, ChartOptions, Legend, RadialLinearScale, Title, Tooltip } from 'chart.js';
import React from 'react';
import { PolarArea } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { IChartData, IChartDataProps } from '../../model';
import { useGeneratedTitle } from '../../hooks';

interface IPolarAreaChartProps extends IChartDataProps {
  data: IChartData;
}

ChartJS.register(Title, Tooltip, Legend, ArcElement, RadialLinearScale);

const PolarAreaChart = ({ data }: IPolarAreaChartProps) => {
  const { showTitle, legendPosition, showLegend, strokeColor, dataMode, strokeWidth } = useChartDataStateContext();

  const chartTitle: string = useGeneratedTitle();

  if (!data) throw new Error('PolarAreaChart: No data to display. Please check the data source.');

  if (!data.datasets || !data.labels)
    throw new Error('PolarAreaChart: No datasets or labels to display. Please check the data source.');

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
        display: showTitle && chartTitle.length > 0,
        text: chartTitle,
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
