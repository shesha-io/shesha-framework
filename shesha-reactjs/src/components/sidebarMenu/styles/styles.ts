import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
  const shaSidebarMenu = cx("sha-sidebar-menu", css`
    .${prefixCls}-menu-item {
      &:hover {
        color: white;
        background-color: ${token.colorPrimaryBgHover} !important;
      }
    }
  `);
  return {
    shaSidebarMenu,
  };
});
