import { createStyles } from 'antd-style';

const useStyles = createStyles(({ }) => ({
  chartControlContainer: { border: '1px solid #ddd', padding: 10, position: 'relative' },
  chartControlButtonContainer: { marginTop: 10, gap: 10 },
  chartControlSpinFontSize: { fontSize: 48 },
  filterComponentContainer: { marginTop: 10, padding: 10, display: 'block', border: '1px solid #ddd' },
  fullWidth: { width: '100%' },
  'margin-top-5': { marginTop: 5 },
  flexCenterCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  'margin-10': { margin: 10 },
  'margin-top-10': { marginTop: 10 },
  'gap-10': { gap: 10 },
}));

export default useStyles;