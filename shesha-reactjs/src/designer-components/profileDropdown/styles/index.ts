import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx, token }) => {
  const shaProfileDropdown = cx(
    'sha-profile-dropdown',
    css`
      width: 200px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0px 5px 0px 5px;
      font-size: ${token.fontSize};
    `
  );
  return {
    shaProfileDropdown,
  };
});