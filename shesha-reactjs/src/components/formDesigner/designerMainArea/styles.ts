import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const designerCanvas = "designer-canvas";
  const canvasAutoWidth = "canvas-auto-width";
  // ${sheshaStyles.thinScrollbars}
  const scrollable = cx("scrollable", css`
    overflow: auto;    
  `);
  const canvasWrapper = cx("canvas-wrapper", css`
    height: 100%;
    /* The single scroll container - the canvas itself must not scroll, see overflow: clip below. */
    overflow: auto;

    /* Absorbs sub-pixel rounding in the measured canvas width. Not applied to device presets,
       which are legitimately wider than the pane. */
    &.${canvasAutoWidth} {
        overflow-x: hidden;
    }

    :has(.${designerCanvas}):not(:has(.sha-component)) {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .${designerCanvas} {
        min-height: auto;
        }
    }
    .${designerCanvas} {
        margin: 0 auto;
        /* min-height, not height: a long form has to be able to grow past the pane. */
        min-height: 100%;
        /* clip, not hidden/auto: keeps vw-sized content inside the device without making the
           canvas a second scroll container. */
        overflow: clip;
        /* border-box so the padding eats into the measured width rather than adding to it. */
        box-sizing: border-box;
        padding: ${sheshaStyles.paddingLG}px;
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
    canvasAutoWidth,
    canvasWrapper,
    canvasPopupContainer,
    scrollable,
  };
});
