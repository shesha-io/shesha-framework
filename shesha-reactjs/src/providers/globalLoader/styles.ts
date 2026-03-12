import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const contentContainer = "content-container";
  const loaderImage = "loader-image";
  const loaderMessage = "loader-message";

  const globalLoaderOverlay = cx("global-loader-overlay", css`
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

    .${contentContainer} {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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
    contentContainer,
    loaderImage,
    loaderMessage,
  };
});
