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

  return {
    verbSelector,
    compactContainer,
    affix,
  };
});
