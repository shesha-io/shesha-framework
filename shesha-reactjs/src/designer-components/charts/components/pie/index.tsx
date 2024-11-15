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


  if (!data || !data.datasets || !data.labels) {
    if (!data)
      throw new Error('PieChart: No data to display. Please check the data source');

    if (!data.datasets || !data.labels)
      throw new Error('PieChart: No datasets or labels to display. Please check the data source');
  }

  data.datasets.forEach((dataset: { data: any[] }) => {
    dataset.data = dataset?.data?.map((item) => item === null || item === undefined ? 'undefined' : item);
  });

  const options: ChartOptions<any> = {
    responsive: true,
    plugins: {
      legend: {
        display: showXAxisScale ? true : false,
        position: legendPosition ?? 'top',
      },
      title: {
        display: showTitle ? true : false,
        text: title?.trim() || `${yProperty} by ${xProperty} (${aggregationMethod})`,
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