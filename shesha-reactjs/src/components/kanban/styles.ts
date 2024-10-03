import { createStyles, css } from 'antd-style';

export const useStyles = createStyles({
    container: css`
        overflow-y: hidden;
        position: relative;
        &:hover .three-dots {
            opacity: 1; 
        };
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
        display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        * {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none;  /* IE and Edge */
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
    columnStyle: css`
        flex: 1 0 100px;
        justify-content: space-between;
        margin: 0 10px;
        padding: 0px;
        border: 1px solid #ddd;
        margin-bottom: 10px;
        background-color: #f5f5f5;
        transition: background-color 0.3s;
        flex-grow: 1;
        box-sizing: border-box;
        width: 250px;
        max-width: 250px;
    `,
});
