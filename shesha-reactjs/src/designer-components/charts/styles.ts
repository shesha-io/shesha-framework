import { createStyles, css } from 'antd-style';

const useStyles = createStyles({
  shaChartControlOuterDiv: css`
      border: '1px solid #ddd';
      padding: 10;
      position: 'relative';
    `,
  // style={{ fontSize: 48 }}
  shaChartControlLoadingIndicator: css`
      fontSize: 48;
    `,
  // style={{ marginTop: 10, gap: 10 }}
  shaChartControlFlex: css`
      marginTop: 10;
      gap: 10;
    `,
});

export default useStyles;