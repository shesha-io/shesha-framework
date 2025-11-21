import { useEffect } from 'react';

/**
 * Custom hook to inject CSS styles for DataTable hint popover arrow styling.
 * This ensures the popover arrow has the correct background color matching the popover body.
 */
export const useDatatableHintPopoverStyles = (): void => {
  useEffect(() => {
    const styleId = 'sha-datatable-hint-popover-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .sha-datatable-hint-popover .ant-popover-arrow:before,
        .sha-datatable-hint-popover .ant-popover-arrow:after {
          background: #D9DCDC !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
};
