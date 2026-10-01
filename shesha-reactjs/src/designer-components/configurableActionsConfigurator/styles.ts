import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  /* Success/fail handler collapses: match the compact bordered CollapsiblePanel look used in the
     properties panel (8px inset all round on both header and body) instead of antd's 12px 16px. */
  const handlerCollapse = cx("sha-action-handler-collapse", css`
    && > .${prefixCls}-collapse-item > .${prefixCls}-collapse-header {
      padding: 8px;
    }

    && > .${prefixCls}-collapse-item > .${prefixCls}-collapse-panel > .${prefixCls}-collapse-body {
      padding: 8px;
    }
  `);

  return { handlerCollapse };
});
