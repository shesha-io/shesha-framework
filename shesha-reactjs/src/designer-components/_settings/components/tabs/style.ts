import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, }) => {

    const searchField = cx(css`
        position: sticky;
        top: -15;
        z-index: 2;
        width: 100%;
        background: #fff;
        padding: 8px 16px;
        `);

    return {
        searchField
    }
});