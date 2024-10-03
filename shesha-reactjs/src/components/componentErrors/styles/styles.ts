import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const cmoponentError = cx("component-error", css`
    .wrapper {
        border: 1px solid black;
        position: relative;
        text-align: center;
        overflow: hidden;
        background-radius: 8px;
        background: 
         linear-gradient(to top left,
             rgba(0,0,0,0) 0%,
             rgba(0,0,0,0) calc(50% - 0.8px),
             rgba(0,0,0,1) 50%,
             rgba(0,0,0,0) calc(50% + 0.8px),
             rgba(0,0,0,0) 100%),
         linear-gradient(to top right,
             rgba(0,0,0,0) 0%,
             rgba(0,0,0,0) calc(50% - 0.8px),
             rgba(0,0,0,1) 50%,
             rgba(0,0,0,0) calc(50% + 0.8px),
             rgba(0,0,0,0) 100%);
    }
  `);

  return {
    cmoponentError,
  };
});