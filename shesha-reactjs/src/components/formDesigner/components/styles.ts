import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {

    const formItem = cx(css`
        
        .ant-row {
            width: 100% !important;
            height: 100% !important;

            .ant-form-item-control-input {
                height: 100%;
                width: 100%;

                .ant-form-item-control-input-content {
                    height: 100%;
                    width: 100%;
                }
            }
        }

        .ant-col {
            width: 100% !important;
            height: 100% !important;

            .ant-form-item-control-input {
                height: 100%;
                width: 100%;

                .ant-form-item-control-input-content {
                    height: 100%;
                    width: 100%;
                }
            }
        }

        :hover {
            border-color: ${token.colorPrimary} !important;
        }

  `);
    return {
        formItem,
    };
});