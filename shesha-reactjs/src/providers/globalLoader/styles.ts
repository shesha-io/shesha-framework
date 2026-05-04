import { createStyles } from '@/styles';

// Must sit above Ant Design modals (z-index: 1000) and other fixed overlays.
// Ant Design uses up to ~1050 for dropdowns/tooltips, so 9999 ensures loaders
// always render on top. Update here if the stacking context changes globally.
const OVERLAY_Z_INDEX = 9999;

export const useStyles = createStyles(({ css, cx }) => {
  const contentContainer = "content-container";
  const loaderImage = "loader-image";
  const loaderMessage = "loader-message";

  // Shared base: full-screen centered layout used by both variants so that
  // switching between blocking and non-blocking is a smooth CSS transition
  // rather than a structural DOM change.
  const base = css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${OVERLAY_Z_INDEX};
    transition: background 0.3s ease-in-out;

    .${contentContainer} {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(30, 30, 30, 0.85);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      padding: 20px 28px;
      transition: all 0.3s ease-in-out;
    }

    .${loaderImage} {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      transition: all 0.3s ease-in-out;
    }

    .${loaderMessage} {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
      white-space: nowrap;
      transition: all 0.3s ease-in-out;
    }
  `;

  // Non-blocking: transparent backdrop so the user can still interact with the page.
  // The card appears centred but clicks pass straight through the overlay.
  const globalLoaderOverlay = cx("global-loader-overlay", base, css`
    background: transparent;
    pointer-events: none;

    * {
      pointer-events: none;
    }
  `);

  // Blocking: dark dimmed backdrop that prevents all user interaction.
  const globalLoaderOverlayBlocking = cx("global-loader-overlay-blocking", base, css`
    background: rgba(0, 0, 0, 0.45);
    pointer-events: auto;
    cursor: not-allowed;

    * {
      pointer-events: none;
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
