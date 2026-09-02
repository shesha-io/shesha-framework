export type DeviceTypes = 'desktop' | 'mobile' | 'tablet' | 'custom';

/**
 * The measurement plumbing the canvas drives from its own ResizeObserver - `setCanvasMeasurement`,
 * `setAvailableCanvasWidth`, `registerCanvas`, `unregisterCanvas` - is deliberately absent. Those
 * exist so a mounted canvas can report its own size; calling one from a script would either be
 * overwritten by the next resize tick or, in the case of `unregisterCanvas`, make every component
 * on the canvas resolve `vw`/`vh` against the browser viewport instead.
 */
export interface ICanvasActions {
  setDesignerDevice(deviceType: DeviceTypes): void;
  setCanvasWidth(width: number | string, deviceType: DeviceTypes): void;
  setCanvasZoom(zoom: number): void;
  setCanvasAutoZoom(value?: boolean): void;
  setCanvasAutoWidth(value?: boolean): void;
  setCanvasWidthPercent(percent: number): void;
  setManualZoom(zoom: number): void;
}

/**
 * Every writable member below is applied through the matching action. The `readonly` ones are
 * derived from the browser, so assigning to one would be silently discarded on the next
 * measurement rather than doing what it looks like it does. The canvas's own live measurement is
 * not exposed here: it changes on every zoom tick and pane resize, and is presentation state of
 * the designer, not of the form.
 */
export interface ICanvasContextApi {
  /** Assigning a zoom is a manual zoom: it turns auto zoom off, as the toolbar input does. */
  zoom?: number;
  autoZoom?: boolean;
  /** "Canvas" preset: width tracks the available space instead of a device preset. */
  autoWidth?: boolean;
  /** Share of the available space taken while `autoWidth` is on. 100 is the maximum. */
  widthPercent?: number;
  /**
   * Assigning a width pins it as a preset and resolves the device from it. Accepts a plain length
   * only: "1024" or "1024px". A percentage such as "80%" is applied as `widthPercent` instead
   * (sizing the canvas to that share of the pane, as the toolbar does), and anything else -
   * "50vw", "80em" - is ignored.
   */
  designerWidth?: string;
  designerDevice?: DeviceTypes;
  /** The device the browser window itself resolves to. */
  readonly physicalDevice?: DeviceTypes;
  /** The device styles are read for: the smaller of the canvas and physical devices. */
  readonly activeDevice?: DeviceTypes;
  api: ICanvasActions;
}
