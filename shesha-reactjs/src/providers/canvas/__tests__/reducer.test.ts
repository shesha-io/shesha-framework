import { describe, expect, it } from 'vitest';
import {
  setAvailableCanvasWidthAction,
  setCanvasAutoWidthAction,
  setCanvasWidthAction,
  setDesignerDeviceAction,
  setScreenWidthAction,
} from '../actions';
import { CANVAS_CONTEXT_INITIAL_STATE, DeviceTypes, ICanvasStateContext } from '../contexts';
import { getInitialState } from '../index';
import { reducer } from '../reducer';

const state = (overrides: Partial<ICanvasStateContext> = {}): ICanvasStateContext => ({
  ...CANVAS_CONTEXT_INITIAL_STATE,
  ...overrides,
});

/** The state after the designer has measured a desktop-sized pane in "Canvas" mode. */
const canvasMode = (overrides: Partial<ICanvasStateContext> = {}): ICanvasStateContext =>
  state({
    autoWidth: true,
    designerWidth: '1900px',
    designerDevice: 'desktop',
    physicalDevice: 'desktop',
    activeDevice: 'desktop',
    ...overrides,
  });

describe('getInitialState - device restored from storage', () => {
  const restored = (designerWidth: string, autoWidth = false): ICanvasStateContext =>
    getInitialState({ designerWidth, zoom: 75, autoWidth });

  // A pinned preset persists its width but not its device. Without deriving the device here, a
  // reload alone was enough to render a 375px canvas from every component's desktop settings block.
  it('derives the device from a restored device-preset width', () => {
    const s = restored('375px');
    expect(s.designerWidth).toBe('375px');
    expect(s.designerDevice).toBe('mobile');
    expect(s.activeDevice).toBe('mobile');
    expect(s.autoWidth).toBe(false);
  });

  it.each<[string, DeviceTypes]>([
    ['375px', 'mobile'],
    ['599px', 'mobile'],
    ['600px', 'tablet'],
    ['724px', 'tablet'],
    ['725px', 'desktop'],
    ['1920px', 'desktop'],
  ])('restores a %s canvas as %s', (width, expected) => {
    expect(restored(width).designerDevice).toBe(expected);
    expect(restored(width).activeDevice).toBe(expected);
  });

  it('falls back to the default device when the stored width is unusable', () => {
    for (const bad of ['', 'not-a-width', '0px', '-10px']) {
      expect(restored(bad).designerDevice).toBe(CANVAS_CONTEXT_INITIAL_STATE.designerDevice ?? 'desktop');
    }
  });

  it('clamps a restored zoom that is out of range', () => {
    expect(getInitialState({ designerWidth: '375px', zoom: 99999, autoWidth: false }).zoom).toBe(400);
    expect(getInitialState({ designerWidth: '375px', zoom: Number.NaN, autoWidth: false }).zoom).toBe(75);
  });

  it('carries the restored autoWidth through', () => {
    expect(restored('1900px', true).autoWidth).toBe(true);
    expect(restored('375px', false).autoWidth).toBe(false);
  });

  // The restored state must be a valid starting point for the reducer, not just a plausible object.
  it('produces a state the reducer accepts unchanged', () => {
    const s = restored('375px');
    expect(reducer(s, setScreenWidthAction(1900))).toMatchObject({
      physicalDevice: 'desktop',
      designerDevice: 'mobile',
      activeDevice: 'mobile',
    });
  });
});

describe('canvas reducer - device selection', () => {
  describe('setAvailableCanvasWidth', () => {
    // The reported bug: picking a device preset and then switching to "Canvas" left
    // designerDevice/activeDevice pinned to the preset, so a 1900px canvas still rendered every
    // component from its `mobile` settings block (getDeviceModel <- activeDevice).
    it('recomputes the device once the canvas is measured after a mobile preset', () => {
      // 1. User picks the iPhone SE (375px) preset
      let s = reducer(state({ physicalDevice: 'desktop' }), setCanvasWidthAction({ width: 375, deviceType: 'mobile' }));
      expect(s.designerDevice).toBe('mobile');
      expect(s.activeDevice).toBe('mobile');
      expect(s.autoWidth).toBe(false);

      // 2. User switches to "Canvas" - this action has no width to work from, so the device is
      //    still the preset's. Asserted so the one stale frame is a documented, deliberate gap.
      s = reducer(s, setCanvasAutoWidthAction(true));
      expect(s.autoWidth).toBe(true);
      expect(s.activeDevice).toBe('mobile');

      // 3. The measurement arrives from SidebarContainer's ResizeObserver
      s = reducer(s, setAvailableCanvasWidthAction('1900px'));
      expect(s.designerWidth).toBe('1900px');
      expect(s.designerDevice).toBe('desktop');
      expect(s.activeDevice).toBe('desktop');
    });

    it('is ignored while a device preset is pinned', () => {
      const pinned = reducer(state(), setCanvasWidthAction({ width: 375, deviceType: 'mobile' }));
      const after = reducer(pinned, setAvailableCanvasWidthAction('1900px'));

      // Identity, not just equality: a stale measurement must not re-render the canvas either.
      expect(after).toBe(pinned);
      expect(after.designerWidth).toBe('375px');
      expect(after.designerDevice).toBe('mobile');
    });

    it('is a no-op when the width and both devices already match', () => {
      const before = canvasMode();
      expect(reducer(before, setAvailableCanvasWidthAction('1900px'))).toBe(before);
    });

    // The old guard returned early on `designerWidth === payload` alone, so a device that had gone
    // stale independently of the width could never be corrected.
    it('corrects a stale device even when the measured width is unchanged', () => {
      const drifted = reducer(canvasMode(), setDesignerDeviceAction('mobile'));
      expect(drifted.designerWidth).toBe('1900px');
      expect(drifted.designerDevice).toBe('mobile');

      const fixed = reducer(drifted, setAvailableCanvasWidthAction('1900px'));
      expect(fixed.designerDevice).toBe('desktop');
      expect(fixed.activeDevice).toBe('desktop');
    });

    it('still clamps the active device to the physical device', () => {
      // A wide canvas in a narrow browser window: the canvas is desktop, but the screen is not.
      const s = reducer(
        canvasMode({ physicalDevice: 'mobile', designerDevice: 'mobile', activeDevice: 'mobile', designerWidth: '375px' }),
        setAvailableCanvasWidthAction('1900px'),
      );

      expect(s.designerDevice).toBe('desktop');
      expect(s.activeDevice).toBe('mobile');
    });

    // Boundaries of getDeviceTypeByWidth: > 724 desktop, > 599 tablet, else mobile.
    it.each<[string, DeviceTypes]>([
      ['1px', 'mobile'],
      ['375px', 'mobile'],
      ['599px', 'mobile'],
      ['600px', 'tablet'],
      ['724px', 'tablet'],
      ['725px', 'desktop'],
      ['1900px', 'desktop'],
    ])('maps a measured %s canvas to %s', (payload, expected) => {
      const s = reducer(canvasMode({ designerWidth: 'stale' }), setAvailableCanvasWidthAction(payload));
      expect(s.designerDevice).toBe(expected);
      expect(s.designerWidth).toBe(payload);
    });

    it.each(['not-a-width', '', '0px', '-10px'])('ignores the unusable measurement %j', (payload) => {
      const before = canvasMode({ designerDevice: 'tablet', activeDevice: 'tablet' });
      const after = reducer(before, setAvailableCanvasWidthAction(payload));

      expect(after).toBe(before);
      expect(after.designerWidth).toBe('1900px');
      expect(after.designerDevice).toBe('tablet');
    });
  });

  describe('surrounding actions still hold their end up', () => {
    it('pinning a preset leaves Canvas mode and sets both devices', () => {
      const s = reducer(canvasMode(), setCanvasWidthAction({ width: 375, deviceType: 'mobile' }));

      expect(s.autoWidth).toBe(false);
      expect(s.designerWidth).toBe('375px');
      expect(s.designerDevice).toBe('mobile');
      expect(s.activeDevice).toBe('mobile');
    });

    it('survives a Canvas -> preset -> Canvas round trip', () => {
      let s = canvasMode();

      s = reducer(s, setCanvasWidthAction({ width: 375, deviceType: 'mobile' }));
      expect(s.activeDevice).toBe('mobile');

      s = reducer(s, setCanvasAutoWidthAction(true));
      s = reducer(s, setAvailableCanvasWidthAction('1900px'));
      expect(s.activeDevice).toBe('desktop');

      s = reducer(s, setCanvasWidthAction({ width: 768, deviceType: 'tablet' }));
      expect(s.autoWidth).toBe(false);
      expect(s.activeDevice).toBe('tablet');
    });

    it('keeps the canvas device when the browser window is resized in Canvas mode', () => {
      // A window resize reports the physical device; the canvas device comes from the measurement
      // that follows. Both must survive the other.
      let s = canvasMode();

      s = reducer(s, setScreenWidthAction(500));
      expect(s.physicalDevice).toBe('mobile');
      expect(s.designerDevice).toBe('desktop');
      expect(s.activeDevice).toBe('mobile');

      s = reducer(s, setScreenWidthAction(1900));
      expect(s.physicalDevice).toBe('desktop');
      expect(s.activeDevice).toBe('desktop');
    });
  });
});
