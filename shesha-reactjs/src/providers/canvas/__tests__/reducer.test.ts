import { describe, expect, it } from 'vitest';
import { reducer } from '../reducer';
import { CANVAS_CONTEXT_INITIAL_STATE, ICanvasStateContext } from '../contexts';
import { setAvailableCanvasWidthAction, setCanvasAutoWidthAction, setCanvasWidthAction, setCanvasWidthPercentAction } from '../actions';
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

  it('re-resolves the device when Canvas mode is switched on', () => {
    // "Canvas" is a sizing mode, not a device: it must not inherit the device a preset pinned.
    const pinnedToMobile = reducer(state(), setCanvasWidthAction({ width: '375px', deviceType: 'mobile' }));
    const canvasMode = reducer({ ...pinnedToMobile, designerWidth: '1125px' }, setCanvasAutoWidthAction(true));

    expect(canvasMode.autoWidth).toBe(true);
    expect(canvasMode.designerDevice).toBe('desktop');
    expect(canvasMode.activeDevice).toBe('desktop');
  });

  it('follows the measured width while Canvas mode is active', () => {
    const canvasMode = state({ autoWidth: true, designerDevice: 'mobile', designerWidth: '375px' });
    const measured = reducer(canvasMode, setAvailableCanvasWidthAction('1125px'));

    expect(measured.designerWidth).toBe('1125px');
    expect(measured.designerDevice).toBe('desktop');
  });

  it('resolves a narrow pane to a real device rather than leaving it as desktop', () => {
    const canvasMode = state({ autoWidth: true, designerDevice: 'desktop', designerWidth: '1125px' });

    expect(reducer(canvasMode, setAvailableCanvasWidthAction('700px')).designerDevice).toBe('tablet');
    expect(reducer(canvasMode, setAvailableCanvasWidthAction('420px')).designerDevice).toBe('mobile');
  });

  it('narrows activeDevice to the smaller of canvas and physical device', () => {
    const onAPhone = state({ autoWidth: true, physicalDevice: 'mobile', designerWidth: '375px' });
    const measured = reducer(onAPhone, setAvailableCanvasWidthAction('1125px'));

    expect(measured.designerDevice).toBe('desktop');
    expect(measured.activeDevice).toBe('mobile');
  });

  it('ignores a measured width outside Canvas mode so a pinned preset is not overwritten', () => {
    const pinned = state({ autoWidth: false, designerWidth: '375px', designerDevice: 'mobile' });
    const next = reducer(pinned, setAvailableCanvasWidthAction('1125px'));

    expect(next).toBe(pinned);
  });

  it('leaves the device alone when the width is not a usable number', () => {
    const canvasMode = state({ autoWidth: true, designerDevice: 'mobile', designerWidth: '375px' });
    const next = reducer(canvasMode, setAvailableCanvasWidthAction('auto'));

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
    const next = reducer(stale, setAvailableCanvasWidthAction('1125px'));

    expect(next.designerWidth).toBe('1125px');
    expect(next.designerDevice).toBe('desktop');
    expect(next.activeDevice).toBe('desktop');
  });

  it('returns the same state object when neither the width nor the device would change', () => {
    const settled = state({ autoWidth: true, designerWidth: '1125px', designerDevice: 'desktop', activeDevice: 'desktop' });

    expect(reducer(settled, setAvailableCanvasWidthAction('1125px'))).toBe(settled);
  });

  it('resolves the device on a percentage change without waiting for a measurement', () => {
    const stale = state({ autoWidth: true, designerWidth: '1125px', designerDevice: 'mobile', activeDevice: 'mobile' });
    const next = reducer(stale, setCanvasWidthPercentAction(80));

    expect(next.widthPercent).toBe(80);
    expect(next.designerDevice).toBe('desktop');
  });
});
