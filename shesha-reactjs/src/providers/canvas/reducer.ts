import { createReducer } from '@reduxjs/toolkit';
import { setCanvasZoomAction,
  setCanvasWidthAction,
  setScreenWidthAction,
  setDesignerDeviceAction,
  setCanvasAutoZoomAction,
  setCanvasAutoWidthAction,
  setCanvasWidthPercentAction,
  setAvailableCanvasWidthAction,
  setManualZoomAction,
} from './actions';
import { CANVAS_CONTEXT_INITIAL_STATE, ICanvasStateContext } from './contexts';
import { clampZoom, getDeviceTypeByWidth, getSmallerDevice } from './utils';
import { MAX_CANVAS_WIDTH_PERCENT, boundCanvasWidthPercent } from './constants';

/**
 * Resolves the device a canvas width implies, and applies it.
 *
 * The "Canvas" preset is a sizing mode, not a device: styling only supports desktop, tablet and
 * mobile, so while Canvas is active the canvas must still resolve to one of those three and
 * render that device's styles. Without this the device stays whatever a preset last pinned - so
 * picking iPhone SE and then Canvas leaves a ~1125px canvas rendering mobile styles.
 *
 * Resolved from the layout width rather than the rendered one: that is the width components
 * actually lay out against, and it is the same quantity a device preset sets directly.
 */
const resolveDeviceForWidth = (state: ICanvasStateContext, width: string): ICanvasStateContext => {
  const parsed = parseFloat(width);
  if (!Number.isFinite(parsed) || parsed <= 0)
    return state;

  const device = getDeviceTypeByWidth(parsed);
  return {
    ...state,
    designerDevice: device,
    activeDevice: getSmallerDevice(device, state.physicalDevice ?? "desktop"),
  };
};

export const reducer = createReducer(CANVAS_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(setCanvasZoomAction, (state, { payload }) => {
      return {
        ...state,
        zoom: clampZoom(payload),
      };
    })
    .addCase(setManualZoomAction, (state, { payload }) => {
      return {
        ...state,
        zoom: clampZoom(payload),
        autoZoom: false,
      };
    })
    .addCase(setCanvasWidthAction, (state, { payload }) => {
      const { width, deviceType } = payload;

      return {
        ...state,
        designerWidth: typeof width === 'string' ? width : `${width}px`,
        designerDevice: deviceType,
        activeDevice: getSmallerDevice(deviceType, state.physicalDevice ?? "desktop"),
        // Picking an explicit device/resolution preset pins the canvas to that width
        autoWidth: false,
        // ...which makes any percentage in force meaningless, so it goes back to the maximum.
        widthPercent: MAX_CANVAS_WIDTH_PERCENT,
      };
    })
    .addCase(setCanvasAutoWidthAction, (state, { payload }) => {
      const autoWidth = payload !== undefined ? payload : !state.autoWidth;

      const next: ICanvasStateContext = {
        ...state,
        autoWidth,
        // Auto zoom has nothing to fit once the canvas sizes itself to its pane, and the toolbar
        // button that would clear it is disabled in this mode. Leaving it set would strand the
        // canvas with zoom neither computed automatically nor adjustable by pinch/ctrl+wheel.
        autoZoom: autoWidth ? false : state.autoZoom,
      };

      // designerWidth here is still whatever the previous mode left behind: a preset's pinned
      // width, or - if auto width was simply toggled off and on - the last measured width.
      // Resolving from it corrects the second case. It cannot correct the first, where the width
      // predates any knowledge of the pane; the measurement that follows owns that, and
      // ZoomableCanvas publishes it before paint so the stale device is never rendered.
      return autoWidth ? resolveDeviceForWidth(next, next.designerWidth) : next;
    })
    .addCase(setCanvasWidthPercentAction, (state, { payload }) => {
      // Bounded again here rather than trusted from the caller: this action is reachable from the
      // canvas context API as well as from the toolbar, and no route may exceed the pane.
      const next: ICanvasStateContext = {
        ...state,
        widthPercent: boundCanvasWidthPercent(payload),
        // A percentage is a fraction of the space available, so the canvas has to be measuring it.
        autoWidth: true,
        // Same invariant as the plain "Canvas" preset - see setCanvasAutoWidthAction.
        autoZoom: false,
      };

      // Resolved now rather than left to the measurement that follows. The percentage changes the
      // layout width, and if the result happens to equal the current width that measurement is a
      // no-op - which would leave the device as whatever a preset last pinned.
      return resolveDeviceForWidth(next, next.designerWidth);
    })
    .addCase(setAvailableCanvasWidthAction, (state, { payload }) => {
      // The measured width is only meaningful for the responsive "Canvas" preset. Ignoring it
      // otherwise keeps a stale measurement from overwriting a pinned device width.
      if (!state.autoWidth)
        return state;

      // The measured width is the canvas width in this mode, so the device follows it - and it is
      // resolved even when the width itself has not moved. A width restored from storage can
      // already equal the freshly measured one while the device is still the initial default, and
      // returning early on the width alone would leave that device stale for the whole session.
      const measured = state.designerWidth === payload ? state : { ...state, designerWidth: payload };
      const resolved = resolveDeviceForWidth(measured, payload);

      // Still a no-op when nothing actually changed, so a repeated measurement costs no re-render.
      return measured === state &&
        resolved.designerDevice === state.designerDevice &&
        resolved.activeDevice === state.activeDevice
        ? state
        : resolved;
    })
    .addCase(setScreenWidthAction, (state, { payload }) => {
      const device = getDeviceTypeByWidth(payload);
      return {
        ...state,
        physicalDevice: device,
        activeDevice: getSmallerDevice(device, state.designerDevice ?? "desktop"),
      };
    })
    .addCase(setDesignerDeviceAction, (state, { payload }) => {
      return {
        ...state,
        designerWidth: state.designerWidth,
        designerDevice: payload,
        activeDevice: getSmallerDevice(payload, state.physicalDevice ?? "desktop"),
      };
    })
    .addCase(setCanvasAutoZoomAction, (state, { payload }) => {
      // Auto zoom fits a fixed-width canvas into its pane; in "Canvas" mode the canvas already
      // fills the pane, so there is nothing to fit. The toolbar button is disabled there, but the
      // invariant belongs in the state rather than in a `disabled` prop: with both flags set,
      // ZoomableCanvas skips the auto-zoom calculation while usePinchZoom stays locked, leaving
      // the zoom neither computed automatically nor adjustable by the user.
      if (state.autoWidth)
        return state.autoZoom ? { ...state, autoZoom: false } : state;

      return {
        ...state,
        autoZoom: payload !== undefined ? payload : !state.autoZoom,
      };
    });
});


