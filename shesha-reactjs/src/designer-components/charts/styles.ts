import { createStyles } from 'antd-style';

const useStyles = createStyles(() => ({
  chartControlContainer: { padding: 10, position: 'relative', boxSizing: 'border-box' , textAlign: 'center' },
  chartControlButtonContainer: { marginTop: 10, gap: 10 },
  chartControlSpinFontSize: { fontSize: 48 },
  filterComponentContainer: { marginTop: 10, padding: 10, display: 'block', border: '1px solid #ddd' },
  fullWidth: { width: '100%' },
  'margin-top-5': { marginTop: 5 },
  flexCenterCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  'margin-10': { margin: 10 },
  'margin-top-10': { marginTop: 10 },
  'margin-bottom-10': { marginBottom: 10 },
  'gap-10': { gap: 10 },
}));

export default useStyles;