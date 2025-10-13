import React, { useMemo, useState, useEffect } from 'react';
import useStyles from '../../styles';
import { TChartType } from '../../model';
import { Button } from 'antd';

const ChartLoader = ({ chartType, handleCancelClick }: { chartType: TChartType; handleCancelClick?: () => void }): JSX.Element => {
  const { styles, cx } = useStyles();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  // Listen for window resize events
  useEffect(() => {
    const handleResize = (): void => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const colors = [
    '#19B411ff',
    '#007E00ff',
    '#7BC42Cff',
    '#D60805ff',
    '#FF6201ff',
    '#F8BD00ff',
    '#00068Dff',
    '#0038B1ff',
    '#000000ff',
  ];

  // Responsive dimensions based on screen size
  const responsiveDimensions = useMemo(() => {
    const isMobile = windowSize.width <= 480;
    const isTablet = windowSize.width <= 768 && windowSize.width > 480;

    if (isMobile) {
      return {
        barHeights: [120, 100, 80, 110, 90, 70, 85, 115],
        svgWidth: 200,
        svgHeight: 100,
        polarSvgSize: 150,
        dotRadius: 3,
        polarRadius: 50,
      };
    } else if (isTablet) {
      return {
        barHeights: [150, 125, 100, 135, 115, 85, 105, 145],
        svgWidth: 250,
        svgHeight: 125,
        polarSvgSize: 175,
        dotRadius: 3.5,
        polarRadius: 60,
      };
    } else {
      return {
        barHeights: [180, 150, 120, 160, 140, 100, 130, 170],
        svgWidth: 300,
        svgHeight: 150,
        polarSvgSize: 200,
        dotRadius: 4,
        polarRadius: 70,
      };
    }
  }, [windowSize.width]);

  const renderLoader = (): JSX.Element => {
    switch (chartType) {
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
            <svg
              viewBox={`0 0 ${responsiveDimensions.svgWidth} ${responsiveDimensions.svgHeight}`}
              width={responsiveDimensions.svgWidth}
              height={responsiveDimensions.svgHeight}
            >
              <polyline
                className={cx(styles.line)}
                points={`0,${responsiveDimensions.svgHeight * 0.8} ${responsiveDimensions.svgWidth * 0.125},
                  ${responsiveDimensions.svgHeight * 0.6} ${responsiveDimensions.svgWidth * 0.25},
                  ${responsiveDimensions.svgHeight * 0.67} ${responsiveDimensions.svgWidth * 0.375},
                  ${responsiveDimensions.svgHeight * 0.4} ${responsiveDimensions.svgWidth * 0.5},
                  ${responsiveDimensions.svgHeight * 0.53} ${responsiveDimensions.svgWidth * 0.625},
                  ${responsiveDimensions.svgHeight * 0.27} ${responsiveDimensions.svgWidth * 0.75},
                  ${responsiveDimensions.svgHeight * 0.47} ${responsiveDimensions.svgWidth * 0.875},
                  ${responsiveDimensions.svgHeight * 0.33} ${responsiveDimensions.svgWidth},
                  ${responsiveDimensions.svgHeight * 0.2}`}
              />
              {[
                [0, responsiveDimensions.svgHeight * 0.8],
                [responsiveDimensions.svgWidth * 0.125, responsiveDimensions.svgHeight * 0.6],
                [responsiveDimensions.svgWidth * 0.25, responsiveDimensions.svgHeight * 0.67],
                [responsiveDimensions.svgWidth * 0.375, responsiveDimensions.svgHeight * 0.4],
                [responsiveDimensions.svgWidth * 0.5, responsiveDimensions.svgHeight * 0.53],
                [responsiveDimensions.svgWidth * 0.625, responsiveDimensions.svgHeight * 0.27],
                [responsiveDimensions.svgWidth * 0.75, responsiveDimensions.svgHeight * 0.47],
                [responsiveDimensions.svgWidth * 0.875, responsiveDimensions.svgHeight * 0.33],
                [responsiveDimensions.svgWidth, responsiveDimensions.svgHeight * 0.2],
              ].map((point, index) => (
                <circle
                  key={index}
                  className={cx(styles.dot)}
                  cx={point[0]}
                  cy={point[1]}
                  r={responsiveDimensions.dotRadius}
                  fill={colors[index]}
                />
              ))}
            </svg>
          </div>
        );

      case 'polarArea':
        return (
          <div className={cx(styles.loaderCard)}>
            <svg
              viewBox={`0 0 ${responsiveDimensions.polarSvgSize} ${responsiveDimensions.polarSvgSize}`}
              width={responsiveDimensions.polarSvgSize}
              height={responsiveDimensions.polarSvgSize}
            >
              <g transform={`translate(${responsiveDimensions.polarSvgSize / 2},${responsiveDimensions.polarSvgSize / 2})`}>
                <path className={cx(styles.segment)} d={`M 0,0 L 0,-${responsiveDimensions.polarRadius} A ${responsiveDimensions.polarRadius},${responsiveDimensions.polarRadius} 0 0,1 ${responsiveDimensions.polarRadius * 0.707},-${responsiveDimensions.polarRadius * 0.707} Z`} fill={colors[0]} />
                <path className={cx(styles.segment)} d={`M 0,0 L ${responsiveDimensions.polarRadius * 0.707},-${responsiveDimensions.polarRadius * 0.707} A ${responsiveDimensions.polarRadius},${responsiveDimensions.polarRadius} 0 0,1 ${responsiveDimensions.polarRadius},0 Z`} fill={colors[1]} />
                <path className={cx(styles.segment)} d={`M 0,0 L ${responsiveDimensions.polarRadius},0 A ${responsiveDimensions.polarRadius},${responsiveDimensions.polarRadius} 0 0,1 ${responsiveDimensions.polarRadius * 0.707},${responsiveDimensions.polarRadius * 0.707} Z`} fill={colors[2]} />
                <path className={cx(styles.segment)} d={`M 0,0 L ${responsiveDimensions.polarRadius * 0.707},${responsiveDimensions.polarRadius * 0.707} A ${responsiveDimensions.polarRadius},${responsiveDimensions.polarRadius} 0 0,1 0,${responsiveDimensions.polarRadius} Z`} fill={colors[3]} />
                <path className={cx(styles.segment)} d={`M 0,0 L 0,${responsiveDimensions.polarRadius} A ${responsiveDimensions.polarRadius},${responsiveDimensions.polarRadius} 0 0,1 -${responsiveDimensions.polarRadius * 0.707},${responsiveDimensions.polarRadius * 0.707} Z`} fill={colors[4]} />
                <path className={cx(styles.segment)} d={`M 0,0 L -${responsiveDimensions.polarRadius * 0.707},${responsiveDimensions.polarRadius * 0.707} A ${responsiveDimensions.polarRadius},${responsiveDimensions.polarRadius} 0 0,1 -${responsiveDimensions.polarRadius},0 Z`} fill={colors[5]} />
                <path className={cx(styles.segment)} d={`M 0,0 L -${responsiveDimensions.polarRadius},0 A ${responsiveDimensions.polarRadius},${responsiveDimensions.polarRadius} 0 0,1 -${responsiveDimensions.polarRadius * 0.707},-${responsiveDimensions.polarRadius * 0.707} Z`} fill={colors[6]} />
                <path className={cx(styles.segment)} d={`M 0,0 L -${responsiveDimensions.polarRadius * 0.707},-${responsiveDimensions.polarRadius * 0.707} A ${responsiveDimensions.polarRadius},${responsiveDimensions.polarRadius} 0 0,1 0,-${responsiveDimensions.polarRadius} Z`} fill={colors[7]} />
              </g>
            </svg>
          </div>
        );

      default:
        return (
          <div className={cx(styles.loaderCard)}>
            <div className={cx(styles.barChartContainer)}>
              {responsiveDimensions.barHeights.map((height, index) => (
                <div
                  key={index}
                  className={cx(styles.bar)}
                  style={{
                    height: `${height}px`,
                    backgroundColor: colors[index],
                  }}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cx(styles.chartLoaderWrapper)}>
      {renderLoader()}
      {handleCancelClick && (
        <Button
          color="danger"
          size="small"
          onClick={handleCancelClick}
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

export default ChartLoader;
