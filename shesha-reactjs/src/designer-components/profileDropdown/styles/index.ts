import { createStyles } from 'antd-style';

interface IStyle {
  subText?: string;
}

export const useStyles = createStyles(({ css, cx, prefixCls, token }, props: IStyle) => {
  const shaProfileDropdownWrapper = cx(
    'sha-profile-dropdown-wrapper',
    css`
      display: flex;
      justify-content: space-between;
      width: ${props?.subText ? '400px' : '200px'};
      align-items: center;
      padding: 0px 5px 0px 5px;
    `,
  );

  const shaProfileDropdown = cx(
    'sha-profile-dropdown',
    css`
      display: flex;
      justify-content: space-between;
      flex-direction: row;
      align-items: center;
      white-space: nowrap;
      flex-wrap: nowrap;
      gap: 5px;
    `,
  );
  const shaProfileMenu = cx('sha-profile-menu', css`
    >.${prefixCls}-dropdown-menu-item {
      &:has(>.${prefixCls}-dropdown-menu-title-content>.active-menu-item) {
        background-color: ${token.colorPrimaryBg} !important;
        color:  ${token.colorPrimary} !important;
      }
    }    
  `);

  return {
    shaProfileDropdownWrapper,
    shaProfileDropdown,
    shaProfileMenu,
  };
});
