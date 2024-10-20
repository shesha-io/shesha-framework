import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, }) => {

    const searchField = cx(css`
        width: 100%;
        background: #fff;
        `);

    return {
        searchField
    }
});