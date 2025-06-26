import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { IChartData, IChartDataProps } from '../../model';
import { useGeneratedTitle } from '../../hooks';
import { splitTitleIntoLines, getPredictableColor } from '../../utils';

interface ILineChartProps extends IChartDataProps {
  data: IChartData;
}

ChartJS.register(CategoryScale, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend);

const LineChart: React.FC<ILineChartProps> = ({ data }) => {
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
    tension,
    strokeColor,
    dataMode,
    strokeWidth,
    simpleOrPivot
  } = useChartDataStateContext();

  const chartTitle: string = useGeneratedTitle();

  // Check if we're on a small screen
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 480;

  useEffect(() => {
    if (dataMode === 'url') {
      data?.datasets?.map((dataset: any) => {
        dataset.borderColor = strokeColor || 'black';
        dataset.pointRadius = isSmallScreen ? 3 : 5; // Smaller points on mobile
        dataset.borderWidth = typeof strokeWidth === 'number' || strokeWidth > 1 ? strokeWidth : 1;
        dataset.tension = tension;
        return dataset;
      });
    } else {
      // For entity mode, use different colors for each dataset in pivot mode
      const isPivotMode = simpleOrPivot === 'pivot';
      
      data?.datasets?.map((dataset: any, index: number) => {
        dataset.tension = tension;
        dataset.borderWidth = typeof strokeWidth === 'number' ? strokeWidth : 0;
        dataset.pointRadius = isSmallScreen ? 3 : 5; // Smaller points on mobile
        
        // Use different colors for each group in pivot mode
        if (isPivotMode) {
          // Generate a unique color for each dataset based on its label
          const label = dataset.label || `Dataset ${index}`;
          dataset.borderColor = getPredictableColor(label);
          dataset.backgroundColor = dataset.borderColor;
        } else {
          // Use the stroke color for single dataset
          dataset.borderColor = strokeColor || 'black';
        }
        
        return dataset;
      });
    }
  }, [dataMode, data?.datasets, strokeColor, strokeWidth, tension, isSmallScreen]);

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: isSmallScreen ? 1.5 : 2, // Smaller aspect ratio on mobile
    animation: {
      duration: isSmallScreen ? 1000 : 1200, // Faster animations on mobile
      easing: 'easeInOutCubic',
      delay: (context) => context.dataIndex * (isSmallScreen ? 20 : 30),
    },
    transitions: {
      active: {
        animation: {
          duration: isSmallScreen ? 250 : 300,
        },
      },
      resize: {
        animation: {
          duration: isSmallScreen ? 500 : 600,
        },
      },
    },
    plugins: {
      legend: {
        display: !!showLegend,
        position: isSmallScreen ? 'bottom' : (legendPosition ?? 'top'), // Move legend to bottom on mobile
        labels: {
          boxWidth: isSmallScreen ? 12 : 40,
          padding: isSmallScreen ? 8 : 10,
          font: {
            size: isSmallScreen ? 10 : 12,
          },
        },
      },
      title: {
        display: !!(showTitle && chartTitle?.length > 0),
        text: splitTitleIntoLines(chartTitle),
        font: {
          size: isSmallScreen ? 12 : 16,
          weight: 'bold',
        },
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
          text: xProperty?.trim() ?? '',
          font: {
            size: isSmallScreen ? 10 : 12,
            weight: 'bold',
          },
          padding: {
            top: isSmallScreen ? 4 : 8,
            bottom: isSmallScreen ? 4 : 8,
          },
        },
        display: !!showXAxisScale,
        offset: true,
        ticks: {
          maxRotation: 45, // Allow rotation up to 45 degrees
          minRotation: 0,
          font: {
            size: isSmallScreen ? 9 : 12,
          },
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
          text: dataMode === 'url' || !aggregationMethod
            ? yProperty?.trim() ?? ''
            : `${yProperty?.trim() ?? ''} (${aggregationMethod})`,
          font: {
            size: isSmallScreen ? 10 : 12,
            weight: 'bold',
          },
          padding: {
            top: isSmallScreen ? 4 : 8,
            bottom: isSmallScreen ? 4 : 8,
          },
        },
        display: !!showYAxisScale,
        beginAtZero: true,
        ticks: {
          font: {
            size: isSmallScreen ? 9 : 12,
          },
          padding: isSmallScreen ? 4 : 8,
          callback: function(value) {
            // Format large numbers on mobile
            if (isSmallScreen && value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value;
          }
        },
        grid: {
          display: !isSmallScreen, // Hide grid on mobile
        },
      },
    },
  };

  return <Line data={data as any} options={options} />;
};

export default LineChart;
