// import { fireEvent, render, screen } from '@testing-library/react';
// import { vi } from 'vitest';
// import type { CSSProperties, ReactNode } from 'react';

/**
 * Wrappers nest - a container's wrapper holds its children's wrappers - so hover handling has to answer
 * two questions correctly at once:
 *  - only the innermost wrapper under the cursor shows a tooltip (ancestors must not pile up);
 *  - every wrapper closes when the cursor leaves, including ancestors of the element that was left.
 * Stopping propagation satisfied the first and broke the second, leaving container tooltips stuck open.
 *
 * The tooltip is also anchored to the cursor rather than to the component, whose right edge can be a whole
 * canvas away for a container, and the anchor lives in the body so the canvas' CSS `zoom` cannot scale the
 * viewport coordinates it is positioned with.
 */

/* const models: Record<string, { id: string; type: string; propertyName: string }> = {
  container: { id: 'container', type: 'container', propertyName: 'outer' },
  child: { id: 'child', type: 'textField', propertyName: 'inner' },
};

vi.mock('@/providers/form', () => ({
  ShaForm: { useComponentModel: (id: string) => models[id] },
}));

vi.mock('@/providers/formDesigner', () => ({
  useFormDesigner: () => ({ setSelectedComponent: vi.fn() }),
  useFormDesignerSelectedComponentId: () => undefined,
  useFormDesignerIsDebug: () => false,
}));

// The real tooltip renders through a portal with motion, which jsdom cannot settle. The stub exposes the
// only things this test cares about: whether a wrapper asked to be open, and the overlay's pointer-events.
interface ITooltipStubProps {
  title?: ReactNode;
  open?: boolean | undefined;
  styles?: { root?: CSSProperties | undefined } | undefined;
  children?: ReactNode;
}

vi.mock('antd', () => ({
  Tooltip: ({ title, open, styles, children }: ITooltipStubProps) => (
    <>
      {Boolean(open) && (
        <div data-testid="tooltip" data-pointer-events={styles?.root?.pointerEvents}>{title}</div>
      )}
      {children}
    </>
  ),
}));

import DragWrapper from '../dragWrapper';

const renderNested = (): { container: HTMLElement; outside: HTMLElement } => {
  const { container } = render(
    <div>
      <DragWrapper componentId="container" className="outer-wrapper">
        <span data-testid="container-chrome">container label</span>
        <DragWrapper componentId="child" className="inner-wrapper">
          <span data-testid="child-content">child input</span>
        </DragWrapper>
      </DragWrapper>
      <div data-testid="canvas">canvas</div>
    </div>,
  );
  return { container, outside: screen.getByTestId('canvas') };
};

const openTooltips = (): string[] => screen.queryAllByTestId('tooltip').map((el) => el.textContent);

const anchorOf = (): HTMLElement | null => screen.queryByTestId('drag-wrapper-tooltip-anchor');

describe('DragWrapper hover tooltip', () => {
  /* it('shows only the innermost wrapper tooltip when hovering a nested component', () => {
    renderNested();

    fireEvent.mouseOver(screen.getByTestId('child-content'));

    const tooltips = openTooltips();
    expect(tooltips).toHaveLength(1);
    expect(tooltips[0]).toContain('inner');
    expect(tooltips[0]).not.toContain('outer');
  });

  it('shows the container tooltip when hovering the container itself', () => {
    renderNested();

    fireEvent.mouseOver(screen.getByTestId('container-chrome'));

    const tooltips = openTooltips();
    expect(tooltips).toHaveLength(1);
    expect(tooltips[0]).toContain('outer');
  });

  it('closes the container tooltip when the cursor moves into a child component', () => {
    renderNested();

    fireEvent.mouseOver(screen.getByTestId('container-chrome'));
    expect(openTooltips()[0]).toContain('outer');

    fireEvent.mouseOut(screen.getByTestId('container-chrome'), {
      relatedTarget: screen.getByTestId('child-content'),
    });
    fireEvent.mouseOver(screen.getByTestId('child-content'));

    const tooltips = openTooltips();
    expect(tooltips).toHaveLength(1);
    expect(tooltips[0]).toContain('inner');
  });

  it('closes every tooltip when the cursor leaves a nested component for the canvas', () => {
    const { outside } = renderNested();

    fireEvent.mouseOver(screen.getByTestId('child-content'));
    expect(openTooltips()).toHaveLength(1);

    fireEvent.mouseOut(screen.getByTestId('child-content'), { relatedTarget: outside });

    expect(openTooltips()).toHaveLength(0);
  });

  it('keeps the tooltip open while the cursor moves between elements inside the same wrapper', () => {
    renderNested();
    const content = screen.getByTestId('child-content');

    fireEvent.mouseOver(content);
    expect(openTooltips()).toHaveLength(1);

    // leaving for a descendant of the same wrapper is not a leave, and must not close/reopen the tooltip
    fireEvent.mouseOut(content, { relatedTarget: content.firstChild ?? content });

    expect(openTooltips()).toHaveLength(1);
  });

  it('renders the overlay without pointer events so hovering it cannot close the tooltip', () => {
    renderNested();

    fireEvent.mouseOver(screen.getByTestId('child-content'));

    expect(screen.getByTestId('tooltip').getAttribute('data-pointer-events')).toBe('none');
  });
  it('anchors the tooltip to the point where the cursor entered the component', () => {
    renderNested();

    fireEvent.mouseOver(screen.getByTestId('child-content'), { clientX: 120, clientY: 64 });

    const anchor = anchorOf();
    expect(anchor).not.toBeNull();
    expect(anchor?.style.position).toBe('fixed');
    expect(anchor?.style.left).toBe('120px');
    expect(anchor?.style.top).toBe('64px');
  });

  it('keeps the anchor pinned while the cursor moves around inside the component', () => {
    renderNested();
    const content = screen.getByTestId('child-content');

    fireEvent.mouseOver(content, { clientX: 120, clientY: 64 });
    fireEvent.mouseOver(content, { clientX: 300, clientY: 210 });

    expect(anchorOf()?.style.left).toBe('120px');
    expect(anchorOf()?.style.top).toBe('64px');
  });

  it('renders the anchor outside the canvas so its coordinates are not scaled by canvas zoom', () => {
    const { container } = renderNested();

    fireEvent.mouseOver(screen.getByTestId('child-content'));

    const anchor = anchorOf();
    expect(anchor).not.toBeNull();
    expect(container.contains(anchor)).toBe(false);
  });

  it('removes the anchor when the tooltip closes', () => {
    const { outside } = renderNested();

    fireEvent.mouseOver(screen.getByTestId('child-content'));
    expect(anchorOf()).not.toBeNull();

    fireEvent.mouseOut(screen.getByTestId('child-content'), { relatedTarget: outside });

    expect(anchorOf()).toBeNull();
  });
});*/
