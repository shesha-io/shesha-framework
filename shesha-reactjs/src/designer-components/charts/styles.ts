import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, cx, prefixCls }) => {

  const chartControlSpinFontSize = cx(`${prefixCls}-chart-control-spin-font-size`, css`
    font-size: 24px;
  `);

  const responsiveChartContainer = cx(`${prefixCls}-responsive-chart-container`, css`
    width: 100%;
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
  `);

  const chartContainerNoBorder = cx(`${prefixCls}-chart-container-no-border`, css`
    border: none;
    padding: 0;
  `);

  const octagonalLoader = cx(`${prefixCls}-octagonal-loader`, css`
    width: 120px;
    height: 120px;
    position: relative;
    -webkit-animation: spin 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    animation: spin 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: 
        conic-gradient(
          #19B411ff 0deg 45deg,
          #007E00ff 45deg 90deg,
          #7BC42Cff 90deg 135deg,
          #D60805ff 135deg 180deg,
          #FF6201ff 180deg 225deg,
          #F8BD00ff 225deg 270deg,
          #00068Dff 270deg 315deg,
          #0038B1ff 315deg 360deg
        );
      -webkit-clip-path: polygon(
        30% 0%,
        70% 0%,
        100% 30%,
        100% 70%,
        70% 100%,
        30% 100%,
        0% 70%,
        0% 30%
      );
      clip-path: polygon(
        30% 0%,
        70% 0%,
        100% 30%,
        100% 70%,
        70% 100%,
        30% 100%,
        0% 70%,
        0% 30%
      );
    }

    &::after {
      content: '';
      position: absolute;
      width: 80%;
      height: 80%;
      top: 10%;
      left: 10%;
      background: white;
      -webkit-clip-path: polygon(
        30% 0%,
        70% 0%,
        100% 30%,
        100% 70%,
        70% 100%,
        30% 100%,
        0% 70%,
        0% 30%
      );
      clip-path: polygon(
        30% 0%,
        70% 0%,
        100% 30%,
        100% 70%,
        70% 100%,
        30% 100%,
        0% 70%,
        0% 30%
      );
    }

    @-webkit-keyframes spin {
      0% { 
        -webkit-transform: rotate(0deg); 
        -webkit-filter: brightness(1);
      }
      50% {
        -webkit-filter: brightness(1.1);
      }
      100% { 
        -webkit-transform: rotate(360deg); 
        -webkit-filter: brightness(1);
      }
    }

    @keyframes spin {
      0% { 
        transform: rotate(0deg); 
        filter: brightness(1);
      }
      50% {
        filter: brightness(1.1);
      }
      100% { 
        transform: rotate(360deg); 
        filter: brightness(1);
      }
    }
  `);

  const loadingText = cx(`${prefixCls}-loading-text`, css`
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-top: 30px;
  `);

  const chartControlContainer = cx(`${prefixCls}-chart-control-container`, css`
    padding: 10px;
    position: relative;
    box-sizing: border-box;
    text-align: center;
  `);

  const chartControlButtonContainer = cx(`${prefixCls}-chart-control-button-container`, css`
    margin-top: 10px;
    gap: 10px;
  `);

  const filterComponentContainer = cx(`${prefixCls}-filter-component-container`, css`
    margin-top: 10px;
    padding: 10px;
    display: block;
    border: 1px solid #ddd;
  `);

  const fullWidth = cx(`${prefixCls}-full-width`, css`
    width: 100%;
  `);

  const marginTop5 = cx(`${prefixCls}-margin-top-5`, css`
    margin-top: 5px;
  `);

  const flexCenterCenter = cx(`${prefixCls}-flex-center-center`, css`
    display: flex;
    align-items: center;
    justify-content: center;
  `);

  const margin10 = cx(`${prefixCls}-margin-10`, css`
    margin: 10px;
  `);

  const marginTop10 = cx(`${prefixCls}-margin-top-10`, css`
    margin-top: 10px;
  `);

  const marginBottom10 = cx(`${prefixCls}-margin-bottom-10`, css`
    margin-bottom: 10px;
  `);

  const gap10 = cx(`${prefixCls}-gap-10`, css`
    gap: 10px;
  `);
  
  return {
    chartControlSpinFontSize,
    responsiveChartContainer,
    chartContainerWithBorder,
    chartContainerNoBorder,
    octagonalLoader,
    loadingText,
    chartControlContainer,
    chartControlButtonContainer,
    filterComponentContainer,
    fullWidth,
    marginTop5,
    flexCenterCenter,
    margin10,
    marginTop10,
    marginBottom10,
    gap10
  };
});

export default useStyles;