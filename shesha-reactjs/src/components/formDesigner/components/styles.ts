import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {

    const formItem = cx(css`
        
        .ant-row, .ant-col {
            width: 100% !important;
            height: 100% !important;

            .ant-form-item-control-input {
                height: 100%;
                width: 100%;

                .ant-form-item-control-input-content {
                    height: 100%;
                    width: 100%;
                }

                .stored-files-renderer-wrapper {
                    width: 100% !important;
                    height: 100% !important;
                }
            }
        }

  `);
    return {
        formItem,
    };
});