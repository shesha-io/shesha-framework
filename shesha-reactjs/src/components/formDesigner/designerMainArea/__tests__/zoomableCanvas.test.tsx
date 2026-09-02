import { render } from '@testing-library/react';
import { FC, PropsWithChildren, ReactNode } from 'react';

// The binder needs the whole data-context stack; canvas measurement publishing does not.
vi.mock('@/providers/dataContextProvider/dataContextBinder', () => ({
  default: (props: PropsWithChildren<{ children?: ReactNode }>) => props.children,
}));

import { CanvasProvider, useCanvasState } from '@/providers/canvas';
import { ICanvasStateContext } from '@/providers/canvas/contexts';
import { DEFAULT_OPTIONS } from '@/providers/canvas/constants';
import { sheshaStyles } from '@/styles';
import { ZoomableCanvas } from '../zoomableCanvas';

/**
 * jsdom computes no layout, so panes advertise their size through a data attribute and the
 * client size getters read the nearest one. ResizeObserver never fires; the canvas's own
 * before-paint seeding covers the initial measurement, which is all these tests need.
 */
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe(): void {}

    unobserve(): void {}

    disconnect(): void {}
  });

  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get(this: HTMLElement): number {
      return Number(this.closest('[data-pane-width]')?.getAttribute('data-pane-width') ?? 0);
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get(this: HTMLElement): number {
      return Number(this.closest('[data-pane-height]')?.getAttribute('data-pane-height') ?? 0);
    },
  });
});

let renders: ICanvasStateContext[] = [];

const Probe: FC = () => {
  renders.push(useCanvasState());
  return null;
};

const observed = (): ICanvasStateContext | undefined => renders[renders.length - 1];

interface IHarnessProps {
  dialogOpen: boolean;
}

/** The designer's canvas, with the quick-edit dialog's second canvas over it when open. */
const Harness: FC<IHarnessProps> = ({ dialogOpen }) => (
  <CanvasProvider>
    <Probe />
    <div data-pane-width="1300" data-pane-height="700">
      <ZoomableCanvas canZoom>main</ZoomableCanvas>
    </div>
    {dialogOpen && (
      <div data-pane-width="600" data-pane-height="400">
        <ZoomableCanvas canZoom>dialog</ZoomableCanvas>
      </div>
    )}
  </CanvasProvider>
);

beforeEach(() => {
  window.localStorage.clear();
  renders = [];
});

const PADDING = 2 * sheshaStyles.paddingLG;
const zoomFactor = DEFAULT_OPTIONS.defaultZoom / 100;

describe('ZoomableCanvas - published measurement', () => {
  it('publishes the content-box width: the border-box layout width less the canvas padding', () => {
    render(<Harness dialogOpen={false} />);

    // Components lay out inside the canvas padding, so vw/bounding must use the content box -
    // against the border-box width, a "maximum" width still overflowed by the padding.
    const layoutWidth = Math.floor(1300 / zoomFactor);
    expect(observed()?.canvas?.width).toBe(`${layoutWidth - PADDING}px`);
  });

  it('keeps the surviving canvas measurement after a sibling canvas unmounts', () => {
    const { rerender } = render(<Harness dialogOpen={false} />);
    const mainWidth = observed()?.canvas?.width;
    expect(mainWidth).toBeDefined();

    // The dialog's canvas publishes over the designer's own while it is open...
    rerender(<Harness dialogOpen={true} />);
    const dialogWidth = observed()?.canvas?.width;
    expect(dialogWidth).not.toBe(mainWidth);

    // ...and closing it must hand the measurement back, not leave the dialog's behind: the
    // survivor's refcount-triggered republish is what puts its own measurement back in effect.
    rerender(<Harness dialogOpen={false} />);
    expect(observed()?.canvas?.width).toBe(mainWidth);
    expect(observed()?.designerWidth).toBe(`${Math.floor(1300 / zoomFactor)}px`);
  });
});
