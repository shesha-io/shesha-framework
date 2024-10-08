import { BarElement, CategoryScale, Chart as ChartJS, ChartOptions, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { IChartData, IChartDataProps } from '../../model';
import { useChartDataStateContext } from '../../../../providers/chartData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps extends IChartDataProps {
  data: IChartData;
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showLegend, showTitle, title, legendPosition, showXAxisLabel, showXAxisLabelTitle, showYAxisLabel, showYAxisLabelTitle, stacked } = useChartDataStateContext();

  const options: ChartOptions<any> = {
    responsive: true,
    plugins: {
      legend: {
        display: showLegend,
        position: legendPosition ?? 'top',
      },
      title: {
        display: showTitle,
        text: title?.trim() || `${yProperty} vs ${xProperty} (${aggregationMethod})`,
      },
    },
    scales: {
      x: {
        title: {
          display: showXAxisLabelTitle,
          text: xProperty,
        },
        display: showXAxisLabel,
        stacked: stacked,
      },
      y: {
        title: {
          display: showYAxisLabelTitle,
          text: `${yProperty} (${aggregationMethod})`,
        },
        display: showYAxisLabel,
        beginAtZero: true,
        stacked: stacked,
      }
    }
  };

  return <Bar data={data as any} options={options} />;
};

export default BarChart;
