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
  } = useChartDataStateContext();

  const chartTitle: string = useGeneratedTitle();

  if (!data?.datasets || !data?.labels) {
    if (!data) throw new Error('BarChart: No data to display. Please check the data source');

    if (!data.datasets || !data.labels)
      throw new Error('BarChart: No datasets or labels to display. Please check the data source');
  }

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: true, // Maintain aspect ratio to prevent overflow
    aspectRatio: 2, // Width to height ratio (2:1)
    plugins: {
      legend: {
        display: !!showLegend,
        position: legendPosition ?? 'top',
      },
      title: {
        display: !!(showTitle && chartTitle?.length > 0),
        text: splitTitleIntoLines(chartTitle),
      },
    },
    scales: {
      x: {
        title: {
          display: !!(showXAxisTitle && xProperty?.trim().length > 0),
          text: xProperty?.trim() ?? '',
        },
        display: !!showXAxisScale,
        stacked: stacked,
        offset: true, // Ensure the x-axis does not coincide with the y-axis
        beginAtZero: false,
      },
      y: {
        title: {
          display: !!(showYAxisTitle && yProperty?.trim().length > 0),
          text: `${yProperty?.trim() ?? ''} ${dataMode === 'url' ? '' : '(' + aggregationMethod + ')'}`,
        },
        display: !!showYAxisScale,
        stacked: stacked,
      },
    },
  };

  return <Bar data={data as any} options={options} />;
};

export default BarChart;
