import { createStyles } from 'antd-style';

const useStyles = createStyles(() => ({
  chartControlContainer: { padding: 10, position: 'relative', boxSizing: 'border-box' , textAlign: 'center' },
  chartControlButtonContainer: { marginTop: 10, gap: 10 },
  chartControlSpinFontSize: { fontSize: 100 },
  filterComponentContainer: { marginTop: 10, padding: 10, display: 'block', border: '1px solid #ddd' },
  fullWidth: { width: '100%' },
  'margin-top-5': { marginTop: 5 },
  flexCenterCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  'margin-10': { margin: 10 },
  'margin-top-10': { marginTop: 10 },
  'margin-bottom-10': { marginBottom: 10 },
  'gap-10': { gap: 10 },
  
  // Responsive chart container
  responsiveChartContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    maxHeight: '100%',
    minWidth: '280px',
    minHeight: '200px',
    transition: 'all 0.3s ease-in-out',
    boxSizing: 'border-box',
    
    // Center the container itself within its parent
    margin: '0 auto',
    
    // Ensure content is centered within the container
    textAlign: 'center',
    
    // Prevent overflow and ensure proper containment
    overflow: 'hidden',
    
    // Chart container should be flexible but contained
    '& > div': {
      maxWidth: '100%',
      maxHeight: '100%',
      width: 'auto',
      height: 'auto',
    },
    
    // Mobile responsive
    '@media (max-width: 768px)': {
      width: '100% !important',
      height: 'auto !important',
      minHeight: '250px',
      padding: '8px',
      margin: '0 auto',
    },
    
    // Tablet responsive
    '@media (max-width: 1024px) and (min-width: 769px)': {
      maxWidth: '95vw',
      maxHeight: '80vh',
      margin: '0 auto',
    },
    
    // Large screen handling
    '@media (min-width: 1400px)': {
      maxWidth: '1200px',
      maxHeight: '800px',
      margin: '0 auto',
    }
  },
  
  // Border variants
  chartContainerWithBorder: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
  },
  
  chartContainerNoBorder: {
    border: 'none',
    borderRadius: 0,
    padding: '8px',
  },
}));

export default useStyles;