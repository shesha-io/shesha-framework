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
import { useGeneratedTitle, useIsSmallScreen } from '../../hooks/hooks';
import { IChartData, IChartDataProps } from '../../model';
import { splitTitleIntoLines, createFontConfig } from '../../utils';

interface BarChartProps extends IChartDataProps {
  data: IChartData;
}

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const {
    axisProperty: xProperty,
    valueProperty: yProperty,
    axisPropertyLabel,
    valuePropertyLabel,
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
    titleFont,
    axisLabelFont,
    legendFont,
    tickFont,
    simpleOrPivot,
  } = useChartDataStateContext();
  const chartTitle: string = useGeneratedTitle();
  const isSmallScreen = useIsSmallScreen();

  if (dataMode === 'url') {
    data.datasets = data?.datasets?.map((dataset: any) => ({
      ...dataset,
      data: dataset?.data?.map((item) => item ?? 'undefined'),
      borderColor: strokeColor || 'black',
      borderWidth: typeof strokeWidth === 'number' ? strokeWidth : 0,
    }));
  }

  const yTitle = (valuePropertyLabel?.trim().length > 0) ? `${valuePropertyLabel}` : `${yProperty} (${aggregationMethod})`;

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: isSmallScreen ? 1.5 : 2, // Smaller aspect ratio on mobile
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
          duration: isSmallScreen ? 300 : 400,
        },
      },
      resize: {
        animation: {
          duration: isSmallScreen ? 600 : 800,
        },
      },
    },
    plugins: {
      legend: {
        display: !!showLegend && simpleOrPivot === 'pivot',
        position: isSmallScreen ? 'bottom' : (legendPosition ?? 'top'), // Move legend to bottom on mobile
        labels: {
          boxWidth: isSmallScreen ? 12 : 40,
          padding: isSmallScreen ? 8 : 10,
          font: createFontConfig(legendFont, isSmallScreen ? 10 : 12, '400'),
          color: legendFont?.color || '#000000',
        },
      },
      title: {
        display: !!(showTitle && chartTitle?.length > 0),
        text: splitTitleIntoLines(chartTitle),
        font: createFontConfig(titleFont, isSmallScreen ? 12 : 16, 'bold'),
        color: titleFont?.color || '#000000',
        padding: {
          top: isSmallScreen ? 8 : 16,
          bottom: isSmallScreen ? 8 : 16,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: !!(showXAxisTitle && xProperty?.trim().length > 0),
          text: dataMode === 'url' ? splitTitleIntoLines(axisPropertyLabel, 12, 1) : splitTitleIntoLines((axisPropertyLabel?.trim().length > 0) ? axisPropertyLabel : xProperty, 12, 1),
          font: createFontConfig(axisLabelFont, isSmallScreen ? 10 : 12, axisLabelFont?.weight || '400'),
          color: axisLabelFont?.color || '#000000',
          padding: {
            top: isSmallScreen ? 4 : 8,
            bottom: isSmallScreen ? 4 : 8,
          },
        },
        display: !!showXAxisScale,
        stacked: stacked,
        offset: true,
        beginAtZero: false,
        ticks: {
          maxRotation: 45, // Allow rotation up to 45 degrees
          minRotation: 0,
          font: createFontConfig(tickFont, isSmallScreen ? 9 : 12, '400'),
          color: tickFont?.color || '#000000',
          padding: isSmallScreen ? 4 : 8,
          autoSkip: false, // Show all labels
          maxTicksLimit: undefined, // Remove tick limit
        },
        grid: {
          display: !isSmallScreen, // Hide grid on mobile for cleaner look
        },
      },
      y: {
        title: {
          display: !!(showYAxisTitle && yProperty?.trim().length > 0),
          text: dataMode === 'url' ? splitTitleIntoLines(valuePropertyLabel, 10, 1) : splitTitleIntoLines(yTitle, 10, 1),
          font: createFontConfig(axisLabelFont, isSmallScreen ? 10 : 12, axisLabelFont?.weight || '400'),
          color: axisLabelFont?.color || '#000000',
          padding: {
            top: isSmallScreen ? 4 : 8,
            bottom: isSmallScreen ? 4 : 8,
          },
        },
        display: !!showYAxisScale,
        stacked: stacked,
        ticks: {
          font: createFontConfig(tickFont, isSmallScreen ? 9 : 12, '400'),
          color: tickFont?.color || '#000000',
          padding: isSmallScreen ? 4 : 8,
          callback: function (value) {
            // Format large numbers on mobile
            if (isSmallScreen && value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value.toLocaleString();
          },
        },
        grid: {
          display: !isSmallScreen, // Hide grid on mobile
        },
      },
    },
  };

  return <Bar data={data as any} options={options} />;
};

export default BarChart;
