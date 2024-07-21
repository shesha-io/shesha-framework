import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
    const container = cx(css`
        min-width: 150px;
        padding-bottom: 8px;

        * {
        font-size: 12px;
        }

        .ant-radio-button-wrapper {
        padding: 4px 4px !important;
        height: max-content;
        line-height: 0;

        svg {
                font-size: 18px;
            }
        }

        .ant-collapse-header {
            padding: 0 4px !important;
            font-size: 14px;
            font-weight: 500;
        }
        
        .ant-collapse-content-box {
            padding-top: 4px !important;
        }


        .ant-color-picker-trigger {
        width: 24px;
        height: 24px;
        }

        .ant-input-number{
            width: 50px;
            height: 24px;
        }

    `);

    const tag = cx(css`
        margin: 0;
        padding: 0;
        width: 60px
        `);

    const flex = cx(css`
        display: flex;
        flex-direction: row;
        flexWrap: wrap; 
        `);

    const input = cx(css`
        .ant-input {
        height: 24px;
        font-size: 12px;
        }

        .ant-select-dropdown {
            padding: 0 4px !important;
            background:red;
        }

        .ant-select-selector {
            padding: 0 4px !important;
            }
            
        .ant-input-group {
            width: auto !important; 
        }
    `);

    const radioBtn = cx(css`
        height: 100%;
    `);

    return {
        container,
        input,
        radioBtn,
        tag,
        flex
    };
});