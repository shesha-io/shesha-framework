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
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;

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
      0% { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `);

  const loadingText = cx(`${prefixCls}-loading-text`, css`
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-top: 30px;
  `);
  
  return {
    chartControlSpinFontSize,
    responsiveChartContainer,
    chartContainerWithBorder,
    chartContainerNoBorder,
    octagonalLoader,
    loadingText,
    chartControlContainer: { padding: 10, position: 'relative', boxSizing: 'border-box' , textAlign: 'center' },
    chartControlButtonContainer: { marginTop: 10, gap: 10 },
    filterComponentContainer: { marginTop: 10, padding: 10, display: 'block', border: '1px solid #ddd' },
    fullWidth: { width: '100%' },
    'margin-top-5': { marginTop: 5 },
    flexCenterCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    'margin-10': { margin: 10 },
    'margin-top-10': { marginTop: 10 },
    'margin-bottom-10': { marginBottom: 10 },
    'gap-10': { gap: 10 }
  };
});

export default useStyles;