import { createStyles, keyframes } from 'antd-style';

const growAnimation = keyframes`
  0%, 100% {
    transform: scaleY(0.3);
    opacity: 0.7;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
`;

const rotatePieAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const drawLineAnimation = keyframes`
  0% {
    stroke-dashoffset: 400;
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const showDotAnimation = keyframes`
  0%, 20% {
    opacity: 0;
    transform: scale(0);
  }
  50%, 100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const polarPulseAnimation = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const useStyles = createStyles(({ css, cx, prefixCls }) => {

  const responsiveChartContainer = cx(`${prefixCls}-responsive-chart-container`, css`
    width: 95%;
    max-width: 95%;
    margin-left: auto;
    margin-right: auto;
    height: 100%;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  `);

  const chartContainerWithBorder = cx(`${prefixCls}-chart-container-with-border`, css`
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    padding: 16px;
    width: 100%;
    height: 100%;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `);

  const chartContainerNoBorder = cx(`${prefixCls}-chart-container-no-border`, css`
    border: none;
    padding: 0;
    width: 100%;
    height: 100%;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `);

  const loadingText = cx(`${prefixCls}-loading-text`, css`
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-top: 30px;
  `);

  // Chart Loader Styles
  const chartLoaderWrapper = cx(`${prefixCls}-chart-loader-wrapper`, css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  `);

  const loaderCard = cx(`${prefixCls}-loader-card`, css`
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  `);

  const barChartContainer = cx(`${prefixCls}-bar-chart-container`, css`
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 200px;
    gap: 8px;
  `);

  const bar = cx(`${prefixCls}-bar`, css`
    width: 30px;
    animation: ${growAnimation} 1.5s ease-in-out infinite;
    transform-origin: bottom;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.1s; }
    &:nth-child(3) { animation-delay: 0.2s; }
    &:nth-child(4) { animation-delay: 0.3s; }
    &:nth-child(5) { animation-delay: 0.4s; }
    &:nth-child(6) { animation-delay: 0.5s; }
    &:nth-child(7) { animation-delay: 0.6s; }
    &:nth-child(8) { animation-delay: 0.7s; }
  `);

  const pieLoaderWrapper = cx(`${prefixCls}-pie-loader-wrapper`, css`
    padding: 10px;
  `);

  const pieLoader = cx(`${prefixCls}-pie-loader`, css`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    position: relative;
    background: conic-gradient(
      #19B411ff 0deg 45deg,
      #007E00ff 45deg 90deg,
      #7BC42Cff 90deg 135deg,
      #D60805ff 135deg 180deg,
      #FF6201ff 180deg 225deg,
      #F8BD00ff 225deg 270deg,
      #00068Dff 270deg 315deg,
      #0038B1ff 315deg 360deg
    );
    animation: ${rotatePieAnimation} 2s linear infinite;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60%;
      height: 60%;
      background-color: white;
      border-radius: 50%;
    }
  `);

  const line = cx(`${prefixCls}-line`, css`
    fill: none;
    stroke: #19B411ff;
    stroke-width: 3;
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: ${drawLineAnimation} 2s ease-in-out infinite;
  `);

  const dot = cx(`${prefixCls}-dot`, css`
    opacity: 0;
    animation: ${showDotAnimation} 2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0s; }
    &:nth-child(3) { animation-delay: 0.25s; }
    &:nth-child(4) { animation-delay: 0.5s; }
    &:nth-child(5) { animation-delay: 0.75s; }
    &:nth-child(6) { animation-delay: 1s; }
    &:nth-child(7) { animation-delay: 1.25s; }
    &:nth-child(8) { animation-delay: 1.5s; }
    &:nth-child(9) { animation-delay: 1.75s; }
    &:nth-child(10) { animation-delay: 2s; }
  `);

  const segment = cx(`${prefixCls}-segment`, css`
    opacity: 0.3;
    transform-origin: 0 0;
    animation: ${polarPulseAnimation} 2s ease-in-out infinite;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.125s; }
    &:nth-child(3) { animation-delay: 0.25s; }
    &:nth-child(4) { animation-delay: 0.375s; }
    &:nth-child(5) { animation-delay: 0.5s; }
    &:nth-child(6) { animation-delay: 0.625s; }
    &:nth-child(7) { animation-delay: 0.75s; }
    &:nth-child(8) { animation-delay: 0.875s; }
  `);

  const loadingContainer = cx(`${prefixCls}-loading-container`, css`
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 20px;
    overflow: hidden;
    
    /* Float the cancel button above the loader */
    & button {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 20;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  `);
  
  return {
    responsiveChartContainer,
    chartContainerWithBorder,
    chartContainerNoBorder,
    loadingText,
    loadingContainer,
    // Chart Loader Styles
    chartLoaderWrapper,
    loaderCard,
    barChartContainer,
    bar,
    pieLoaderWrapper,
    pieLoader,
    line,
    dot,
    segment
  };
});

export default useStyles;