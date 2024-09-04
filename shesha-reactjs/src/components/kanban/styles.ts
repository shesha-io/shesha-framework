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
        right: 10px;
        top: 10px;
    `,
    threeDotsStyle: css`
        position: absolute;
        top: 0;  
        right: 0; 
        z-index: 10;
        opacity: 0; 
        transition: opacity 0.3s ease;
    `,
});
