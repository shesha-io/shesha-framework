import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, layout) => {

    const formItem = cx(css`
        
        .ant-form-item-row {
            display: flex !important;
            height: 100%;
            width: 100%
        }

        .ant-row .ant-form-item-control {
            width: 100% !important;
            height: 100% !important;
            max-height: ${layout === 'vertical' ? 'calc(100% - 32px)' : '100%'};

            .ant-form-item-control-input {
                height: 100%;
                width: 100%;

                .ant-form-item-control-input-content {
                    height: 100%;
                    width: 100%;
                    > div {
                    height: 100%;
                    width: 100%; 
                    }
                }
            }
        }

        .ant-form-item-label {
            max-height: 32px !important;
        }


  `);
    return {
        formItem,
    };
});