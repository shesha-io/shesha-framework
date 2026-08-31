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
    /* The wrapper is the single scroll container. The canvas deliberately does not scroll itself: a
       vertical scrollbar inside a pane that already scrolls leaves the canvas cut off short of the
       pane - and because CSS zoom scales the resolved height, the further the canvas is zoomed out
       the shorter that box gets. Growing with the content and letting the wrapper scroll keeps one
       scrollbar in one place at any zoom. */
    overflow: auto;

    /* "Canvas" resolution: the canvas is laid out to render exactly as wide as this pane, so a
       horizontal scrollbar is never wanted - components re-wrap into the space instead. The canvas
       width is computed from a measured pixel value scaled by CSS zoom, so sub-pixel rounding can
       still leave it a fraction over; without this, that fraction shows up as a scrollbar along the
       bottom. Only applied in this mode: a device preset wider than the pane (e.g. Full HD in a
       narrow window) genuinely needs to scroll horizontally. */
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
        /* Fills the pane exactly, and no more. A bottom margin here left the canvas ending short of
           the pane - a band of wrapper visible under its shadowed bottom edge - and adding one back
           on top of a full 100% overflows the pane by exactly that margin, which shows up as a
           vertical scrollbar that is always present. min-height rather than height so a form with
           more content than fits can still grow past the pane and scroll. */
        min-height: 100%;
        /* The canvas is the device screen: nothing inside it may be painted past its edge, on
           either axis. A component sized in viewport units resolves against the browser viewport
           rather than the canvas, so on a small device preset a "100vh" container overshoots the
           canvas bottom and is drawn outside the screen it is meant to sit in. Clipping keeps the
           render inside the selected device.

           "clip" rather than "hidden" or "auto" so the canvas never becomes a scroll container: the
           single scrollbar stays on the wrapper, as the comment above requires. A form that is long
           because it has many components still grows the canvas box and scrolls on the wrapper -
           only content that overshoots the box itself is cut. Popups are portalled into
           #canvas-popup-container outside the canvas, so they are unaffected. */
        overflow: clip;
        /* Breathing room so components are not flush against the canvas edge. Explicit border-box:
           the canvas width is a measured pixel value, so padding must eat into it rather than add
           to it - otherwise the canvas ends up wider than the pane it was sized to fill. */
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
