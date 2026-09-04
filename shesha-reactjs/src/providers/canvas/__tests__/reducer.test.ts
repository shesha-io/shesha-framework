import { reducer } from '../reducer';
import { CANVAS_CONTEXT_INITIAL_STATE, ICanvasStateContext } from '../contexts';
import { registerCanvasAction, setAvailableCanvasWidthAction, setCanvasAutoWidthAction, setCanvasMeasurementAction, setCanvasWidthAction, setCanvasWidthPercentAction, setScreenWidthAction, unregisterCanvasAction } from '../actions';
import { MAX_CANVAS_WIDTH_PERCENT } from '../constants';

const state = (overrides: Partial<ICanvasStateContext> = {}): ICanvasStateContext => ({
  ...CANVAS_CONTEXT_INITIAL_STATE,
  physicalDevice: 'desktop',
  ...overrides,
});

describe('canvas reducer - device resolution', () => {
  it('pins the device to the preset when a device width is picked', () => {
    const next = reducer(state({ autoWidth: true }), setCanvasWidthAction({ width: '375px', deviceType: 'mobile' }));

    expect(next.designerWidth).toBe('375px');
    expect(next.designerDevice).toBe('mobile');
    expect(next.autoWidth).toBe(false);
  });

  it('does not inherit the pinned device once the pane is measured in Canvas mode', () => {
    // Real order: preset pins width and device, Canvas is switched on while designerWidth is still
    // that pinned width, and only then does the measurement arrive. The stale step is asserted
    // because it is the frame ZoomableCanvas keeps off screen by publishing before paint.
    const pinnedToMobile = reducer(state(), setCanvasWidthAction({ width: '375px', deviceType: 'mobile' }));
    expect(pinnedToMobile.designerDevice).toBe('mobile');

    const canvasMode = reducer(pinnedToMobile, setCanvasAutoWidthAction(true));
    expect(canvasMode.autoWidth).toBe(true);
    expect(canvasMode.designerWidth).toBe('375px');
    expect(canvasMode.designerDevice).toBe('mobile');

    const measured = reducer(canvasMode, setAvailableCanvasWidthAction({ layoutWidth: '1900px', deviceWidth: '1900px' }));
    expect(measured.designerWidth).toBe('1900px');
    expect(measured.designerDevice).toBe('desktop');
    expect(measured.activeDevice).toBe('desktop');
  });

  it('follows the measured width while Canvas mode is active', () => {
    const canvasMode = state({ autoWidth: true, designerDevice: 'mobile', designerWidth: '375px' });
    const measured = reducer(canvasMode, setAvailableCanvasWidthAction({ layoutWidth: '1125px', deviceWidth: '1125px' }));

    expect(measured.designerWidth).toBe('1125px');
    expect(measured.designerDevice).toBe('desktop');
  });

  it('resolves a narrow pane to a real device rather than leaving it as desktop', () => {
    const canvasMode = state({ autoWidth: true, designerDevice: 'desktop', designerWidth: '1125px' });

    expect(reducer(canvasMode, setAvailableCanvasWidthAction({ layoutWidth: '700px', deviceWidth: '700px' })).designerDevice).toBe('tablet');
    expect(reducer(canvasMode, setAvailableCanvasWidthAction({ layoutWidth: '420px', deviceWidth: '420px' })).designerDevice).toBe('mobile');
  });

  it('narrows activeDevice to the smaller of canvas and physical device', () => {
    const onAPhone = state({ autoWidth: true, physicalDevice: 'mobile', designerWidth: '375px' });
    const measured = reducer(onAPhone, setAvailableCanvasWidthAction({ layoutWidth: '1125px', deviceWidth: '1125px' }));

    expect(measured.designerDevice).toBe('desktop');
    expect(measured.activeDevice).toBe('mobile');
  });

  it('ignores a measured width outside Canvas mode so a pinned preset is not overwritten', () => {
    const pinned = state({ autoWidth: false, designerWidth: '375px', designerDevice: 'mobile' });
    const next = reducer(pinned, setAvailableCanvasWidthAction({ layoutWidth: '1125px', deviceWidth: '1125px' }));

    expect(next).toBe(pinned);
  });

  it('leaves the device alone when the width is not a usable number', () => {
    const canvasMode = state({ autoWidth: true, designerDevice: 'mobile', designerWidth: '375px' });
    const next = reducer(canvasMode, setAvailableCanvasWidthAction({ layoutWidth: 'auto', deviceWidth: 'auto' }));

    expect(next.designerDevice).toBe('mobile');
  });
});

describe('canvas reducer - percentage width', () => {
  it('applies a percentage below the maximum as entered', () => {
    const next = reducer(state(), setCanvasWidthPercentAction(80));

    expect(next.widthPercent).toBe(80);
    // A percentage is a share of the space available, so the canvas has to be measuring it.
    expect(next.autoWidth).toBe(true);
    expect(next.autoZoom).toBe(false);
  });

  it('bounds a percentage above the maximum, whatever route it arrives by', () => {
    expect(reducer(state(), setCanvasWidthPercentAction(150)).widthPercent).toBe(MAX_CANVAS_WIDTH_PERCENT);
    expect(reducer(state(), setCanvasWidthPercentAction(10000)).widthPercent).toBe(MAX_CANVAS_WIDTH_PERCENT);
  });

  it('falls back to the maximum for a percentage that is not usable', () => {
    expect(reducer(state(), setCanvasWidthPercentAction(0)).widthPercent).toBe(MAX_CANVAS_WIDTH_PERCENT);
    expect(reducer(state(), setCanvasWidthPercentAction(-25)).widthPercent).toBe(MAX_CANVAS_WIDTH_PERCENT);
    expect(reducer(state(), setCanvasWidthPercentAction(Number.NaN)).widthPercent).toBe(MAX_CANVAS_WIDTH_PERCENT);
  });

  it('drops the percentage when a device preset pins an absolute width', () => {
    const atEightyPercent = reducer(state(), setCanvasWidthPercentAction(80));
    const pinned = reducer(atEightyPercent, setCanvasWidthAction({ width: '375px', deviceType: 'mobile' }));

    expect(pinned.widthPercent).toBe(MAX_CANVAS_WIDTH_PERCENT);
    expect(pinned.autoWidth).toBe(false);
  });

  it('leaves the percentage alone when Canvas mode is toggled', () => {
    // The plain "Canvas" preset and a percentage are the same mode, so toggling must not silently
    // reset a percentage the user chose.
    const atEightyPercent = reducer(state(), setCanvasWidthPercentAction(80));
    const toggled = reducer(atEightyPercent, setCanvasAutoWidthAction(true));

    expect(toggled.widthPercent).toBe(80);
  });

  it('starts at the maximum', () => {
    expect(CANVAS_CONTEXT_INITIAL_STATE.widthPercent).toBe(MAX_CANVAS_WIDTH_PERCENT);
  });
});

describe('canvas reducer - a stale device is corrected, without needless re-renders', () => {
  it('resolves the device even when the measured width has not moved', () => {
    // The width restored from storage can already equal the freshly measured one while the device
    // is still the initial default. Returning early on the width alone stranded it there.
    const stale = state({ autoWidth: true, designerWidth: '1125px', designerDevice: 'mobile', activeDevice: 'mobile' });
    const next = reducer(stale, setAvailableCanvasWidthAction({ layoutWidth: '1125px', deviceWidth: '1125px' }));

    expect(next.designerWidth).toBe('1125px');
    expect(next.designerDevice).toBe('desktop');
    expect(next.activeDevice).toBe('desktop');
  });

  it('returns the same state object when neither the width nor the device would change', () => {
    const settled = state({ autoWidth: true, designerWidth: '1125px', designerDevice: 'desktop', activeDevice: 'desktop' });

    expect(reducer(settled, setAvailableCanvasWidthAction({ layoutWidth: '1125px', deviceWidth: '1125px' }))).toBe(settled);
  });

  it('resolves the device on a percentage change without waiting for a measurement', () => {
    const stale = state({ autoWidth: true, designerWidth: '1125px', designerDevice: 'mobile', activeDevice: 'mobile' });
    const next = reducer(stale, setCanvasWidthPercentAction(80));

    expect(next.widthPercent).toBe(80);
    expect(next.designerDevice).toBe('desktop');
  });
});

describe('canvas reducer - canvas measurement', () => {
  const MEASURED = { width: '1024px', height: '820px' };

  it('has no canvas until one is mounted, which is what tells a rendered page apart', () => {
    expect(state().canvas).toBeUndefined();
    expect(state().canvasMounts).toBe(0);
  });

  it('records the measurement a mounted canvas reports', () => {
    expect(reducer(state(), setCanvasMeasurementAction(MEASURED)).canvas).toEqual(MEASURED);
  });

  it('returns the same state object when neither axis has moved', () => {
    const measured = reducer(state(), setCanvasMeasurementAction(MEASURED));

    expect(reducer(measured, setCanvasMeasurementAction({ ...MEASURED }))).toBe(measured);
  });

  it('drops the measurement once the last canvas unmounts', () => {
    const mounted = reducer(reducer(state(), registerCanvasAction()), setCanvasMeasurementAction(MEASURED));

    const unmounted = reducer(mounted, unregisterCanvasAction());
    expect(unmounted.canvasMounts).toBe(0);
    expect(unmounted.canvas).toBeUndefined();
  });

  it('keeps the measurement while a second canvas is still mounted', () => {
    // The quick-edit dialog opens a canvas over the designer's own; closing it must not blank it.
    const both = reducer(reducer(reducer(state(), registerCanvasAction()), registerCanvasAction()), setCanvasMeasurementAction(MEASURED));

    const dialogClosed = reducer(both, unregisterCanvasAction());
    expect(dialogClosed.canvasMounts).toBe(1);
    expect(dialogClosed.canvas).toEqual(MEASURED);
  });

  it('does not go negative if unregister outruns register', () => {
    expect(reducer(state(), unregisterCanvasAction()).canvasMounts).toBe(0);
  });
});

describe('canvas reducer - the rendered page is not styled for a device pinned in the designer', () => {
  it('takes the physical device alone when no canvas is mounted', () => {
    // The reported leak: pin iPhone SE once, and every rendered page in that browser stayed mobile.
    const stored = state({ designerDevice: 'mobile', activeDevice: 'mobile', canvasMounts: 0 });

    expect(reducer(stored, setScreenWidthAction(1440)).activeDevice).toBe('desktop');
  });

  it('still narrows to the pinned device while a canvas is mounted', () => {
    const inDesigner = state({ designerDevice: 'mobile', activeDevice: 'mobile', canvasMounts: 1 });

    expect(reducer(inDesigner, setScreenWidthAction(1440)).activeDevice).toBe('mobile');
  });
});

describe('canvas reducer - zoom does not retarget the device', () => {
  it('resolves the device from the on-screen width, not the zoom-derived layout width', () => {
    // At 200% zoom a 1300px pane lays out at 650px, which alone would read as tablet.
    const canvasMode = state({ autoWidth: true, canvasMounts: 1 });

    const measured = reducer(canvasMode, setAvailableCanvasWidthAction({ layoutWidth: '650px', deviceWidth: '1300px' }));

    expect(measured.designerWidth).toBe('650px');
    expect(measured.designerDevice).toBe('desktop');
  });
});
