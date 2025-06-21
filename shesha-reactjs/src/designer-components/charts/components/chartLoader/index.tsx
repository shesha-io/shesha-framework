import React from 'react';
import useStyles from '../../styles';
import { TChartType } from '../../model';

const ChartLoader = ({ chartType }: { chartType: TChartType }) => {
  const { styles, cx } = useStyles();
  
  const colors = [
    '#19B411ff',
    '#007E00ff',
    '#7BC42Cff',
    '#D60805ff',
    '#FF6201ff',
    '#F8BD00ff',
    '#00068Dff',
    '#0038B1ff',
    '#000000ff'
  ];

  const renderLoader = () => {
    switch (chartType) {
      default:
      case 'bar':
        return (
          <div className={cx(styles.loaderCard)}>
            <div className={cx(styles.barChartContainer)}>
              {[180, 150, 120, 160, 140, 100, 130, 170].map((height, index) => (
                <div
                  key={index}
                  className={cx(styles.bar)}
                  style={{
                    height: `${height}px`,
                    backgroundColor: colors[index]
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className={cx(styles.loaderCard)}>
            <div className={cx(styles.pieLoaderWrapper)}>
              <div className={cx(styles.pieLoader)} />
            </div>
          </div>
        );

      case 'line':
        return (
          <div className={cx(styles.loaderCard)}>
            <svg viewBox="0 0 300 150" width="300" height="150">
              <polyline 
                className={cx(styles.line)} 
                points="0,120 37.5,90 75,100 112.5,60 150,80 187.5,40 225,70 262.5,50 300,30" 
              />
              {[[0, 120], [37.5, 90], [75, 100], [112.5, 60], [150, 80], 
                [187.5, 40], [225, 70], [262.5, 50], [300, 30]].map((point, index) => (
                <circle 
                  key={index}
                  className={cx(styles.dot)} 
                  cx={point[0]} 
                  cy={point[1]} 
                  r="4" 
                  fill={colors[index]}
                />
              ))}
            </svg>
          </div>
        );

      case 'polarArea':
        return (
          <div className={cx(styles.loaderCard)}>
            <svg viewBox="0 0 200 200" width="200" height="200">
              <g transform="translate(100,100)">
                <path className={cx(styles.segment)} d="M 0,0 L 0,-70 A 70,70 0 0,1 49.5,-49.5 Z" fill={colors[0]} />
                <path className={cx(styles.segment)} d="M 0,0 L 49.5,-49.5 A 70,70 0 0,1 70,0 Z" fill={colors[1]} />
                <path className={cx(styles.segment)} d="M 0,0 L 70,0 A 70,70 0 0,1 49.5,49.5 Z" fill={colors[2]} />
                <path className={cx(styles.segment)} d="M 0,0 L 49.5,49.5 A 70,70 0 0,1 0,70 Z" fill={colors[3]} />
                <path className={cx(styles.segment)} d="M 0,0 L 0,70 A 70,70 0 0,1 -49.5,49.5 Z" fill={colors[4]} />
                <path className={cx(styles.segment)} d="M 0,0 L -49.5,49.5 A 70,70 0 0,1 -70,0 Z" fill={colors[5]} />
                <path className={cx(styles.segment)} d="M 0,0 L -70,0 A 70,70 0 0,1 -49.5,-49.5 Z" fill={colors[6]} />
                <path className={cx(styles.segment)} d="M 0,0 L -49.5,-49.5 A 70,70 0 0,1 0,-70 Z" fill={colors[7]} />
              </g>
            </svg>
          </div>
        );
      }
  };

  return (
    <div className={cx(styles.chartLoaderWrapper)}>
      {renderLoader()}
    </div>
  );
};

export default ChartLoader;