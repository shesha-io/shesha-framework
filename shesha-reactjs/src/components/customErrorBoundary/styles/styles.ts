import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const bigFont = 45;
  const primaryFont = 26;
  const secondaryFont = 18;

  const oops = "oops";
  const errorIcon = "error-icon";
  const primaryMessage = "primary-message";
  const secondaryMessage = "secondary-message";
  const takeMeHome = "take-me-home";
  const errorScreen = "error-screen";

  const customErrorBoundary = cx("custom-error-boundary", css`
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      justify-items: center;
      align-content: center;
    
      .${oops} {
        font-size: ${bigFont}px;
      }
    
      .${errorIcon} {
        margin-top: 15px;
        font-size: ${bigFont}px;
      }
    
      .${primaryMessage} {
        font-size: ${primaryFont}px;
      }
    
      .${secondaryMessage} {
        font-size: ${secondaryFont}px;
      }
    
      .${takeMeHome} {
        margin-bottom: ${bigFont}px;
      }
    `);
  return {
    customErrorBoundary,
    oops,
    errorIcon,
    primaryMessage,
    secondaryMessage,
    takeMeHome,
    errorScreen,
  };
});
