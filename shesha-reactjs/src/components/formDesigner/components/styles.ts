import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, layout) => {

    const formItem = cx(css`
        --ant-form-item-margin-bottom: 0px !important;
        .ant-form-item-row {
            height: 100%;
            width: 100%;
        }

        .ant-row .ant-form-item-control {
            width: 100% !important;
            height: 100% !important;
            max-height: ${layout === 'vertical' ? 'calc(100% - 32px)' : '100%'};
            margin: auto;

            .ant-form-item-control-input {
                min-height : 0px !important;
                height: 100%;
                width: 100%;

                .ant-form-item-control-input-content {
                    height: 100%;
                    width: 100%;
                    > div {
                     vertical-align: middle;
                    }
                }
            }
        }


  `);
    return {
        formItem,
    };
});