import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {

    const inlineInputs = cx(css`
        align-items: end !important;
        display: flex;
        flex-wrap: wrap;
        gap: 0px 8px;
    `);

    const rowInputs = cx(css`
        display: flex;
        flex-wrap: wrap;
        gap: 0px 8px;
        `);


    const unitSelector = cx(css`
        .ant-select-selector {
        padding: 0 !important;
        padding-inline-end: 5px !important;
        align-self: auto !important;
        line-height: auto !important;
        align-self: top !important;
        padding-left: 0 !important;
    }
    `);

    return {
        unitSelector,
        inlineInputs,
        rowInputs
    };
});