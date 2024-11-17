import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {

    const image = cx(css`
        max-width: 150px;
        
        .ant-upload-list-item-container {
        //  top: -30px !important;
         position: relative;
        }
    `);

    const replaceBtn = cx(css`
        position: relative;
        top: -75px;
        left: 100px;
        `);

    return {
        image,
        replaceBtn
    };
});