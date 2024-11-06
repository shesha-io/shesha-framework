import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineController, LineElement, PointElement,
    Title, Tooltip
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { IChartData, IChartDataProps } from '../../model';

interface ILineChartProps extends IChartDataProps {
    data: IChartData;
}

ChartJS.register(
    CategoryScale,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

const LineChart: React.FC<ILineChartProps> = ({ data }) => {
    const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showLegend, showTitle, title, legendPosition, showXAxisScale, showXAxisTitle, showYAxisScale, showYAxisTitle, tension, legendProperty, strokeColor, dataMode, borderWidth } = useChartDataStateContext();

    if (!data || !data.datasets || !data.labels) {
        if (!data)
            throw new Error('LineChart: No data to display. Please check the data source');

        if (!data.datasets || !data.labels)
            throw new Error('LineChart: No datasets or labels to display. Please check the data source');
    }

    if (dataMode === 'url') {
        data?.datasets?.map((dataset: any) => {
            dataset.borderColor = strokeColor || 'black';
            dataset.pointRadius = 5;
            dataset.borderWidth = typeof (borderWidth) === 'number' || borderWidth < 1 ? borderWidth : 1;
            dataset.tension = tension;
            return dataset;
        });
    } else {
        data?.datasets?.map((dataset: any) => {
            dataset.tension = tension;
            return dataset;
        });
    }

    const options: any = {
        responsive: true,
        plugins: {
            legend: {
                display: showLegend ? true : false,
                position: legendPosition ?? 'top',
            },
            title: {
                display: showTitle ? true : false,
                text: title?.trim() || `${yProperty} vs ${xProperty} (${aggregationMethod})${legendProperty ? `, grouped by ${legendProperty}` : ''}`,
            }
        },
        scales: {
            x: {
                title: {
                    display: showXAxisTitle ? true : false,
                    text: xProperty, // X-axis title
                },
                display: showXAxisScale ? true : false,
                offset: true, // Ensure the x-axis does not coincide with the y-axis
            },
            y: {
                title: {
                    display: showYAxisTitle ? true : false,
                    text: `${yProperty} (${aggregationMethod})`,
                },
                display: showYAxisScale ? true : false,
                beginAtZero: true
            }
        }
    };

    return <Line data={data as any} options={options} />;
};

export default LineChart;
