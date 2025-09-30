import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

export const useStyles = createStyles(({ css, cx }, { fullStyles }: { fullStyles: CSSProperties }) => {

  const dateField = cx(
    "sha-dropdown",
    css`
          --ant-color-text: ${fullStyles?.color || '#000'} !important;
          --ant-font-size: ${fullStyles?.fontSize || '14px'} !important;
          --ant-font-weight: ${fullStyles?.fontWeight || '400'} !important;
          --ant-text-align: ${fullStyles?.textAlign || 'left'} !important;

      
          .ant-picker-input input {
            font-weight: var(--ant-font-weight) !important;
            text-align: var(--ant-text-align) !important;
          }
      
          .ant-picker-cell-inner {
            font-weight: var(--ant-font-weight) !important;
          }
        `,
  );


  return {
    dateField,
  };
});
