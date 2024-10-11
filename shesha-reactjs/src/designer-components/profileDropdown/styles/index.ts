import { createStyles } from 'antd-style';

interface IStyle {
  subText?: string;
}

export const useStyles = createStyles(({ css, cx }, props: IStyle) => {
  const shaProfileDropdownWrapper = cx(
    'sha-profile-dropdown-wrapper',
    css`
      display: flex;
      justify-content: space-between;
      width: ${props.subText ? '400px' : '200px'};
      align-items: center;
      padding: 0px 5px 0px 5px;
      font-size: 12;
    `
  );

  const shaProfileDropdown = cx(
    'sha-profile-dropdown',
    css`
      display: flex;
      justify-content: space-between;
      flex-direction: row;
    `
  );

  return {
    shaProfileDropdownWrapper,
    shaProfileDropdown,
  };
});
