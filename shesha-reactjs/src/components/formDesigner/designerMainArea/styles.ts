import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const designerCanvas = "designer-canvas";
  // ${sheshaStyles.thinScrollbars}
  const scrollable = cx("scrollable", css`
    overflow: auto;    
  `);
  const canvasWrapper = cx("canvas-wrapper", css`
    height: 100%;
    :has(.${designerCanvas}):not(:has(.sha-component)) {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .${designerCanvas} {
        height: auto;
        }
    }
    .${designerCanvas} {
        margin: 0 auto;
        height: 100%;
        overflow: auto;
        transform-origin: top left;
        box-shadow: 1px 1px 5px 5px #00000080;
    }
  `);


  const canvasPopupContainer = cx("canvas-popup-container", css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    transform-origin: top left;
    z-index: 100;

    > * {
        pointer-events: auto;
    }
  `);

  return {
    designerCanvas,
    canvasWrapper,
    canvasPopupContainer,
    scrollable,
  };
});
