import { createStyles } from 'antd-style';
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, responsive, token }) => {
  const shaGlobalTableFilter = cx(
    'sha-global-table-filter',
    css`
      padding-right: ${sheshaStyles.paddingLG}px;
      width: 350px;

      .ant-input-group-wrapper {
        .ant-input-wrapper {
          .ant-input-affix-wrapper {
            &:hover,
            &:focus-within {
              border-color: ${token.colorPrimary};
            }
          }
        }

        .ant-btn {
          &:hover,
          &:active,
          &:focus-within {
            border-color: ${token.colorPrimary};
          }
        }

        svg {
          &:hover,
          &:active,
          &:focus-within {
            color: ${token.colorPrimary};
          }
        }
      }

      ${responsive.lg} {
        width: 55%;
      }
      ${responsive.sm} {
        padding-right: 0;
        width: 100%;
      }
    `
  );
  return {
    shaGlobalTableFilter,
  };
});
