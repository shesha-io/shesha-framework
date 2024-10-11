import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend
} from 'chart.js';
import { IChartData, IChartDataProps } from '../../model';
import { useChartDataStateContext } from '../../../../providers/chartData';

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
    const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showLegend, showTitle, title, legendPosition, showXAxisLabel, showXAxisLabelTitle, showYAxisLabel, showYAxisLabelTitle, tension } = useChartDataStateContext();

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
                text: title || `${yProperty} vs ${xProperty} (${aggregationMethod})`,
            }
        },
        scales: {
            x: {
                title: {
                    display: showXAxisLabelTitle,
                    text: xProperty, // X-axis title
                },
                display: showXAxisLabel
            },
            y: {
                title: {
                    display: showYAxisLabelTitle,
                    text: `${yProperty} (${aggregationMethod})`, // Y-axis title
                },
                display: showYAxisLabel,
                beginAtZero: true
            }
        }
    };

    return <Line data={data as any} options={options} />;
};

export default LineChart;
