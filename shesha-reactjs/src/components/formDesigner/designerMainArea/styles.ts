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
    /* Reserved always, so a classic scrollbar appearing cannot narrow the pane and re-wrap it. */
    scrollbar-gutter: stable;

    /* Absorbs sub-pixel rounding in the measured canvas width. Not applied to device presets,
       which are legitimately wider than the pane. */
    &.${canvasAutoWidth} {
        overflow-x: hidden;
    }

    .${designerCanvas} {
        margin: 0 auto;
        /* The height that fills the pane is applied inline, from the same measurement the width
           comes from. A percentage cannot do it: it resolves against the unzoomed wrapper, so
           below 100% zoom it renders short by exactly the zoom factor.
           clip, not hidden/auto: keeps vw-sized content inside the device without making the
           canvas a second scroll container. */
        overflow: clip;
        /* border-box so the padding eats into the measured width rather than adding to it. */
        box-sizing: border-box;
        padding: ${sheshaStyles.paddingLG}px;
        transform-origin: top left;
    }

    /* The empty canvas used to be shrunk to its content and centred in the pane, to put the
       empty-state hint mid-screen. That is what made an empty form read as a small framed card
       floating in the work area, so it is gone: the canvas always fills the pane, and the hint
       sits where the first component will. */

    /* A device preset is a screen floating in a larger pane, so it is given an edge. In "Canvas"
       mode the canvas *is* the work area and fills the pane - an edge there just draws a border
       around the whole designer. */
    &:not(.${canvasAutoWidth}) .${designerCanvas} {
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
