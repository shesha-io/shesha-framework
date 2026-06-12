import { ArcElement, Chart, ChartData, Chart as ChartJS, ChartOptions, Color, Legend, LegendItem, RadialLinearScale, Title, Tooltip } from 'chart.js';
import React, { ReactElement } from 'react';
import { PolarArea } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { IChartData, IChartDataProps } from '../../model';
import { useGeneratedTitle } from '../../hooks/hooks';
import { splitTitleIntoLines, createFontConfig } from '../../utils';
import { isNonEmptyArray } from '@/utils/array';
import { isDefined } from '@/utils/nullables';
interface IPolarAreaChartProps extends IChartDataProps {
  data: IChartData;
}

ChartJS.register(Title, Tooltip, Legend, ArcElement, RadialLinearScale);

const PolarAreaChart = ({ data }: IPolarAreaChartProps): ReactElement => {
  const { showTitle, legendPosition, showLegend, strokeColor, dataMode, strokeWidth, titleFont, legendFont, tickFont } = useChartDataStateContext();

  const chartTitle: string = useGeneratedTitle();

  data.datasets.forEach((dataset) => {
    dataset.data = dataset.data?.map((item) => isDefined(item) ? item : 'undefined');
  });

  if (dataMode === 'url') {
    data.datasets.forEach((dataset) => {
      dataset.borderColor = strokeColor || 'black';
      dataset.borderWidth = typeof strokeWidth === 'number' && strokeWidth > 1 ? strokeWidth : 1;
      dataset.strokeColor = strokeColor || 'black';
    });
  }

  const options: ChartOptions<"polarArea"> = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to fill available space
    aspectRatio: 1, // Square aspect ratio for polar area charts
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
          duration: 350, // Quick animation for hover effects
        },
      },
      resize: {
        animation: {
          duration: 700, // Smooth resize animation
        },
      },
    },
    scales: {
      r: {
        ticks: {
          color: tickFont?.color || '#000000',
          font: createFontConfig(tickFont, 14, 400),
          backdropColor: 'rgba(255, 255, 255, 0)', // Remove the tick's backdrop
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.2)', // Make grid lines more transparent
        },
      },
    },
    plugins: {
      legend: {
        display: !!showLegend,
        position: legendPosition ?? 'top',
        align: (legendPosition === 'left' || legendPosition === 'right') ? 'center' : 'center',
        fullSize: false, // This ensures legend doesn't consume chart space
        labels: {
          boxWidth: 20,
          padding: 10,
          // font: createFontConfig(legendFont, 12, '400'),
          color: legendFont?.color || '#000000',
          usePointStyle: true, // Use point style for better visual consistency
          // generateLabels(chart: Chart): LegendItem[];
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
                  lineWidth: (dataset.borderWidth ?? 1) as number,
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
        display: !!(showTitle && chartTitle.length > 0),
        text: splitTitleIntoLines(chartTitle),
        font: createFontConfig(titleFont, 16, 'bold'),
        color: titleFont?.color || '#000000',
        align: 'center',
        fullSize: false, // This ensures title doesn't consume chart space
      },
    },
  };

  return <PolarArea data={data as ChartData<"polarArea">} options={options} />;
};

export default PolarAreaChart;
