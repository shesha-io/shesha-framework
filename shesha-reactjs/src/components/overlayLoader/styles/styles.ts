import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const body = "body";
  const loadingContainer = "loading-container";
  const text = "text";
  const overlayLoader = cx("overlay-loader", css`
        display: flex;
        height: 100vh;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        position: fixed;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        z-index: 5000;
        flex-direction: row;
        align-content: center;
        align-items: center;
        justify-content: space-around;

        .${body} {
            .${loadingContainer} {
                text-align: center;
                margin-bottom: 18px;
            }

            .${text} {
                color: white;
                font-size: 18px;
                font-weight: 400;
            }
        }   
  `);
  return {
    overlayLoader,
    body,
    loadingContainer,
    text,
  };
});
