import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const hideWhenEmpty = cx("hide-empty", css`
      &:not(:has(>.${prefixCls}-card-body .${prefixCls}-form-item:not(.${prefixCls}-form-item-hidden))) {
        display: none;
      }
    `);

  return {
    hideWhenEmpty,
  };
});
