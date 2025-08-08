import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {

    const formItem = cx(css`

        .ant-row {
            width: 100% !important;
            height: 100% !important;
        }
        .ant-form-item {
            width: 100% !important;
            height: 100% !important;
            margin-bottom: 0 !important;
           
            .ant-form-item-row {
                width: 100% !important;
                height: 100% !important;
            }
           
            .ant-form-item-control {
                width: 100% !important;
                height: 100% !important;
            }
           
            .ant-form-item-control-input {
                width: 100% !important;
                height: 100% !important;
            }
           
            .ant-form-item-control-input-content {
                width: 100% !important;
                height: 100% !important;
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