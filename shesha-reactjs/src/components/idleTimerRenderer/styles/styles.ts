import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx }) => {
  const idleTimerContent = "idle-timer-content";
  const idleTimerContentTopHint = "idle-timer-content-top-hint";
  const idleTimerContentBottomHint = "idle-timer-content-bottom-hint";

  const shaIdleTimerRenderer = cx("sha-idle-timer-renderer", css`
    .${idleTimerContent} {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    
        .${idleTimerContentTopHint} {
            margin-bottom: ${sheshaStyles.paddingLG}px;
        }
    
        .${idleTimerContentBottomHint} {
            margin-top: ${sheshaStyles.paddingLG}px;
        }
    }
  `);

  return {
    shaIdleTimerRenderer,
    idleTimerContent,
    idleTimerContentTopHint,
    idleTimerContentBottomHint,
  };
});
