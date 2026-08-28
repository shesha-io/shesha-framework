import { createStyles, sheshaStyles } from '@/styles';
import { LAYOUT_CONSTANTS } from '../../../shesha-constants';

/**
 * Padding inside the designer canvas, in canvas (pre-zoom) pixels. Exported because the canvas uses
 * `box-sizing: border-box`, so this padding eats into the height a component sized in `vh` may
 * occupy - see `getCanvasVhUnit`. Keep the two in step by reading this rather than re-stating the
 * number.
 */
export const CANVAS_PADDING = sheshaStyles.paddingLG;

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const LEFT_SIDEBAR_WIDTH = "550px";
  const { SIDEBAR_BTN_HEIGHT, TOOLBAR_HEIGHT, HEADER_HEIGHT } = LAYOUT_CONSTANTS;

  const sidebarContainerHeader = "sidebar-container-header";
  const sidebarContainerBody = "sidebar-container-body";
  const sidebarContainerMainArea = "sidebar-container-main-area";
  const sidebarContainerMainAreaBody = "sidebar-container-main-area-body";
  const sidebarHeader = "sidebar-header";
  const sidebarHeaderTitle = "sidebar-header-title";
  const sidebarHeaderBtn = "sidebar-header-btn";
  const sidebarBody = "sidebar-body";
  const sidebarBodyPlaceholder = "sidebar-body-placeholder";
  const sidebarBodyContent = "sidebar-body-content";
  const sidebarContainerLeft = "sidebar-container-left";
  const sidebarContainerRight = "sidebar-container-right";
  const canvasWrapper = "canvas-wrapper";
  const canvasAutoWidth = "canvas-auto-width";
  const designerCanvas = "designer-canvas";
  const canvasPopupContainer = "canvas-popup-container";

  const sidebarContainer = cx("sidebar-container", css`
      width: 100%;
      overflow: hidden;
      /* Pass a definite height down to the panes. The body element below asks for 100%, which
         without this resolves against an auto-height parent and collapses to auto - leaving the
         canvas pane content-sized, so a zoomed canvas grows the page instead of scrolling.
         Harmless where no ancestor has a definite height (the embedded datatable panels): the
         percentage simply stays auto, exactly as before. */
      height: 100%;

      .${sidebarContainerMainAreaBody}{
        overflow: auto;
        height: 100%;
        ${sheshaStyles.thinScrollbars}
      }
    
      .${sidebarContainerHeader} {
        padding: ${sheshaStyles.paddingLG}px;
        background-color: white;
      }
    
      .${sidebarContainerBody} {
        height: 100%;
        display: flex;
        position: relative;
        width: 100%;
        min-height: 100%;
    
        .${sidebarContainerLeft},
        .${sidebarContainerRight} {
          &.allow-full-collapse {
            display: none;
          }
    
          &.open {
            width: ${LEFT_SIDEBAR_WIDTH};
            display: block;
            overflow: auto;
            ${sheshaStyles.thinScrollbars}

            .${sidebarHeader} {
              .sidebar-header-title {
                display: flex;
                width:100%;
              }

            }
          }
    
          background: white;

          .sidebar-subheader {
            margin-top: 8px;
            background: #282828;
            font-weight: 500;
            font-size: 16px;
            color: white;
            margin: 8px -12px;
            padding: 4px 12px;
          }
    
          .${sidebarHeader} {
            display: flex;
    
            .sidebar-header-title {
              width: calc(${LEFT_SIDEBAR_WIDTH} - ${SIDEBAR_BTN_HEIGHT});
              display: none;
              align-items: center;
              padding: 0 ${sheshaStyles.paddingLG}px;
              font-weight: 500;
              font-size: 14px;
            }
    
            .${sidebarHeaderBtn} {
              height: ${SIDEBAR_BTN_HEIGHT};
              width: ${SIDEBAR_BTN_HEIGHT};
              display: flex;
              justify-content: center;
              align-items: center;
              font-weight: bolder;
              cursor: pointer;
            }
          }
    
          .${sidebarBody} {
            overflow-x: hidden;
            overflow-y: auto;
            display: flex;
            height: calc(100vh - ${HEADER_HEIGHT} - ${TOOLBAR_HEIGHT} - ${SIDEBAR_BTN_HEIGHT});
            padding: ${sheshaStyles.paddingLG}px;
            flex: 1;
            ${sheshaStyles.thinScrollbars}
    
            .sidebar-body-content {
              width: 100%;
              display: none;
    
              &.open {
                display: block;
              }
            }
    
            .sidebar-body-placeholder {
              width: ${SIDEBAR_BTN_HEIGHT};
    
              &.open {
                width: 0;
              }
            }
          }
        }
    
        .${sidebarContainerLeft} {
          border-right: 1px solid lightgrey;
    
          &.open {
            .toggle-open-btn {
              transform: rotateX(180deg);
            }
          }
        }
    
        .${sidebarContainerRight} {
          border-left: 1px solid lightgrey;
    
          &.open {
            .toggle-open-btn {
              transform: rotateX(180deg);
            }
          }
    
          .${sidebarHeader} {
            flex-direction: row-reverse;
    
            .sidebar-header-title {
              justify-content: flex-end;
            }
          }
    
          .${sidebarBody} {
            flex-direction: row-reverse;
          }
    
          .${prefixCls}-row.${prefixCls}-form-item {
            margin-bottom: 16px;
          }
    
        }

        .${sidebarContainerMainArea} {
          width: 100%;
          overflow: auto;

          &::not(.no-padding) {
            padding: ${sheshaStyles.paddingLG}px;
          }
        }

        /* "Canvas" resolution: the canvas is laid out to render exactly as wide as this pane, so a
           horizontal scrollbar is never wanted - components re-wrap into the space instead. The
           canvas width is computed from a measured pixel value scaled by CSS zoom, so sub-pixel
           rounding can still leave it a fraction over; without this, that fraction shows up as a
           scrollbar along the bottom. Only applied in this mode: a device preset wider than the
           pane (e.g. Full HD in a narrow window) genuinely needs to scroll horizontally. */
        .${sidebarContainerMainArea}.${canvasWrapper}.${canvasAutoWidth} {
          overflow-x: hidden;
        }

        .${designerCanvas} {
          margin: 0 auto;
          /* The canvas deliberately does not scroll itself. A vertical scrollbar inside a pane that
             already scrolls leaves the canvas cut off short of the pane - and because CSS zoom
             scales the resolved height, the further the canvas is zoomed out the shorter that box
             gets. Growing with the content and letting the wrapper scroll keeps one scrollbar in
             one place at any zoom, while min-height keeps the canvas filling the pane when the
             form is short. */
          min-height: 100%;
          overflow: visible;
          /* Breathing room so components are not flush against the canvas edge. Explicit
             border-box: the canvas width is a measured pixel value, so padding must eat into it
             rather than add to it - otherwise the canvas ends up wider than the pane it was sized
             to fill. */
          box-sizing: border-box;
          padding: ${CANVAS_PADDING}px;
          transform-origin: top left;
          box-shadow: 1px 1px 5px 5px #00000080;
        }

        /* When the designer canvas is empty (no components dropped yet), the
           zoomed canvas collapses to a short, top-aligned box, leaving the
           empty-state hint above the vertical midpoint. Center the zoomed
           canvas within the (non-zoomed) wrapper so the hint sits mid-screen.
           Scoped to the designer canvas + empty state so other sidebar
           consumers and non-empty forms keep their normal top-aligned flow. */
        .${sidebarContainerMainArea}.${canvasWrapper}:has(.${designerCanvas}):not(:has(.sha-component)) {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .${designerCanvas} {
            min-height: auto;
          }
        }
      }

      /* Inline usage (e.g. the datatable advanced-filter / columns-selector panel)
         reuses this container as a plain component rather than a full-screen editor.
         In that case the sidebar body must size to its own content, capped at the
         viewport, instead of forcing a fixed ~full-viewport height. The fixed
         calc(100vh - ...) height is only correct for the full-screen editors
         (Config Studio, model configurator); applied inline it inflates the whole
         component to ~92vh and pushes the table below the fold. */
      &.embedded {
        .${sidebarContainerBody} .${sidebarContainerRight}.open .${sidebarBody},
        .${sidebarContainerBody} .${sidebarContainerLeft}.open .${sidebarBody} {
          height: auto;
          max-height: calc(100vh - ${HEADER_HEIGHT} - ${TOOLBAR_HEIGHT} - ${SIDEBAR_BTN_HEIGHT});
        }
      }

      .${canvasPopupContainer} {
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
      }
    `);

  return {
    sidebarContainer,
    sidebarContainerHeader,
    sidebarContainerBody,
    sidebarContainerMainArea,
    sidebarContainerMainAreaBody,
    sidebarHeader,
    sidebarHeaderTitle,
    sidebarHeaderBtn,
    sidebarBody,
    sidebarBodyPlaceholder,
    sidebarBodyContent,
    sidebarContainerLeft,
    sidebarContainerRight,
    designerCanvas,
    canvasWrapper,
    canvasAutoWidth,
    canvasPopupContainer,
  };
});
