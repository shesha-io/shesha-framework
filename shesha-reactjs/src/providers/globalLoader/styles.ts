import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const contentContainer = "content-container";
  const loaderImage = "loader-image";
  const loaderMessage = "loader-message";

  // Non-blocking: Small corner indicator, doesn't block interaction
  const globalLoaderOverlay = cx("global-loader-overlay", css`
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px 24px;
    z-index: 9999;
    pointer-events: none; /* Don't block clicks */

    .${contentContainer} {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
    }

    .${loaderImage} {
      width: 24px;
      height: 24px;
    }

    .${loaderMessage} {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      white-space: nowrap;
    }
  `);

  // Blocking: Full-screen overlay that prevents all interaction
  const globalLoaderOverlayBlocking = cx("global-loader-overlay-blocking", css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    pointer-events: auto;
    cursor: not-allowed;

    * {
      pointer-events: none;
    }

    .${contentContainer} {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .${loaderImage} {
      margin-bottom: 16px;
    }

    .${loaderMessage} {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
  `);

  return {
    globalLoaderOverlay,
    globalLoaderOverlayBlocking,
    contentContainer,
    loaderImage,
    loaderMessage,
  };
});
