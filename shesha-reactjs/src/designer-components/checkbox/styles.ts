import { createStyles } from '@/styles';
import React from 'react';

export const useStyles = createStyles(({ css, cx }, style: React.CSSProperties) => {
  const checkbox = cx('sha-checkbox', css`
    .ant-checkbox-inner: {
        backgroundColor: unset;
      background: ${style?.backgroundImage || style?.backgroundColor} !important;
    }
  `);

  return {
    checkbox
  };
});