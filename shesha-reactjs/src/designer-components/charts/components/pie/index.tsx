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
import { Pie, Doughnut } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { IChartData, IChartDataProps } from '../../model';
import { useGeneratedTitle } from "../../hooks";

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
  const { showLegend, showTitle, legendPosition, isDoughnut } = useChartDataStateContext(); 

  const chartTitle: string = useGeneratedTitle();

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
        display: showLegend ? true : false,
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

  return isDoughnut ? <Doughnut data={data as any} options={options} /> : <Pie data={data as any} options={options} />;
};

export default PieChart;