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
    const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showLegend, showTitle, title, legendPosition, showXAxisScale, showXAxisLabelTitle, showYAxisScale, showYAxisLabelTitle, tension, legendProperty } = useChartDataStateContext();

    data.datasets.forEach((dataset: any) => {
        dataset.tension = tension;
    });

    const options: any = {
        responsive: true,
        plugins: {
            legend: {
                display: showLegend,
                position: legendPosition ?? 'top',
            },
            title: {
                display: showTitle,
                text: title?.trim() || `${yProperty} vs ${xProperty} (${aggregationMethod})${legendProperty ? `, grouped by ${legendProperty}` : ''}`,
            }
        },
        scales: {
            x: {
                title: {
                    display: showXAxisLabelTitle,
                    text: xProperty, // X-axis title
                },
                display: showXAxisScale,
                offset: true, // Ensure the x-axis does not coincide with the y-axis
            },
            y: {
                title: {
                    display: showYAxisLabelTitle,
                    text: `${yProperty} (${aggregationMethod})`, // Y-axis title
                },
                display: showYAxisScale,
                beginAtZero: true
            }
        }
    };

    return <Line data={data as any} options={options} />;
};

export default LineChart;
