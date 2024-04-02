import { createStyles } from 'antd-style';
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const shaGlobalEmptyState = cx(
    'sha-global-empty-state',
    css `
      padding-right: ${sheshaStyles.paddingLG}px;
      width: 350px;

        .ant-title {
          color: ${token.colorPrimary};
          font-size: ${token.sizeLG};
          margin-top: ${token.sizeMS};
          font-weight: ${token.fontWeightStrong};
        }

        .ant-paragraph {
          color: ${token.colorPrimary};
          font-size: ${token.sizeMD};
        }
      }

      div {
        display: "flex";
        justify-content: "center";
        flex-direction: "column";
        align-items: "center";
        margin: "30px;
      }
    `
  );
  return {
    shaGlobalEmptyState,
  };
});
