import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token, css }) => ({
  newStyle: css`
    min-height: 100px;
    max-height: 500px;
    height: 100%;
    display: flex;
    flex-direction: column;
  `,
  newHeaderStyle: css`
    padding: 10px;
    background-color: ${token.colorPrimary};
    color: ${token.colorText};
    font-size: 16px;
    text-align: center;
    border-bottom: 1px solid ${token.colorBorder};
  `,
}));
