import { createStyles, css } from 'antd-style';

export const useStyles = createStyles({
    container: css`
        position: relative;
        &:hover .three-dots {
            opacity: 1; 
        }
    `,
    actions: css`
        position: absolute;
        right: 15px;
        top: 15px;
    `,
    threeDotsStyle: css`
        position: absolute;
        top: 0;  
        right: 0; 
        margin: 5px;
        z-index: 10;
        opacity: 0; 
        transition: opacity 0.3s ease;
    `,
});
