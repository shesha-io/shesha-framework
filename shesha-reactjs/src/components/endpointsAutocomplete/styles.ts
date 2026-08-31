import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const verbSelector = cx(css`
    width: 120px;
  `);

  const compactContainer = cx(css`
    width: 100%;
  `);

  // antd's tertiary text token (rgba(0,0,0,0.45)) — matches Input prefix/suffix grey
  const affix = cx(css`
    color: ${token.colorTextTertiary};
  `);

  const schemeWarning = cx(css`
    color: ${token.colorWarningText};
    font-size: ${token.fontSizeSM}px;
    margin-top: 4px;
  `);

  return {
    verbSelector,
    compactContainer,
    affix,
    schemeWarning,
  };
});
