import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }, { autoAlignLabel = true }) => {
  const settingsFormItem = cx(css`
        margin: 0px !important;
  `);


  const formItem = cx(css`

        .ant-row {
            width: 100% !important;
        }

        .ant-form-item-row {
            width: 100% !important;

            > .ant-form-item-label {
                ${autoAlignLabel ? `
                  > label {
                    height: 100%;
                  }
                ` : ''};
            }
        }

        .ant-form-item-control {
            width: 100% !important;
            align-self: center;
        }
       
        .ant-form-item-control-input {
            width: 100% !important;
            min-height: 0px !important;
        }
       
        .ant-form-item-control-input-content {
            width: 100% !important;
        }

        &:hover {
            border-color: ${token.colorPrimary} !important;
        }
  `);
  return {
    formItem,
    settingsFormItem,
  };
});
