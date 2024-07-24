import { createStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, token }) => {
    const primaryColor = token.colorPrimary;
    const helpIcon = "help-icon-question-circle";
    const titleContainer = cx("title-container", css`
            flex-wrap: nowrap;
             white-space: 'nowrap';
            display: flex;
            alignItems: center;
            width: 100%;
    `);

    return {
        primaryColor, helpIcon, titleContainer
    };
});