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
    const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showLegend, showTitle, title, legendPosition, showXAxisScale, showXAxisTitle, showYAxisScale, showYAxisTitle, tension, legendProperty } = useChartDataStateContext();

    data.datasets.map((dataset: any) => {
        dataset.borderWidth = 2;
        dataset.tension = tension;
        dataset.pointRadius = 5;
        return dataset;
    });

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
                    text: `${yProperty} (${aggregationMethod})`, // Y-axis title
                },
                display: showYAxisScale ? true : false,
                beginAtZero: true
            }
        }
    };

    return <Line data={data as any} options={options} />;
};

export default LineChart;
