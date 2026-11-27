import { clearRowFromCanvas, highlightComponentOnCanvas, highlightRowFromCanvas, scrollCanvasToComponent } from '../canvasBridge';

describe('canvasBridge', () => {
  afterEach(() => {
    highlightComponentOnCanvas(null, '');
    highlightRowFromCanvas(null);
    document.body.innerHTML = '';
  });

  it('outlines a canvas component while its row is hovered, one at a time', () => {
    document.body.innerHTML = '<div data-sha-drag-wrapper="a"></div><div data-sha-drag-wrapper="b"></div>';
    const a = document.querySelector('[data-sha-drag-wrapper="a"]');
    const b = document.querySelector('[data-sha-drag-wrapper="b"]');

    highlightComponentOnCanvas('a', 'red');
    expect(a).toHaveClass('sha-layers-canvas-hover');

    highlightComponentOnCanvas('b', 'red');
    expect(a).not.toHaveClass('sha-layers-canvas-hover');
    expect(b).toHaveClass('sha-layers-canvas-hover');

    highlightComponentOnCanvas(null, 'red');
    expect(b).not.toHaveClass('sha-layers-canvas-hover');
  });

  it('highlights a visible row when its component is hovered on the canvas', () => {
    document.body.innerHTML = '<div data-layer-row-id="a"></div>';
    const row = document.querySelector('[data-layer-row-id="a"]');

    highlightRowFromCanvas('a');
    expect(row).toHaveClass('is-canvas-hover');

    clearRowFromCanvas('other');
    expect(row).toHaveClass('is-canvas-hover');

    clearRowFromCanvas('a');
    expect(row).not.toHaveClass('is-canvas-hover');
  });

  it('scrolls the canvas up or down only as far as needed, never sideways', () => {
    document.body.innerHTML = '<div id="canvas" style="overflow-y: auto"><div data-sha-drag-wrapper="a"></div></div>';
    const canvas = document.getElementById('canvas');
    const element = document.querySelector<HTMLElement>('[data-sha-drag-wrapper="a"]');
    if (canvas === null || element === null)
      throw new Error('missing elements');
    const scrollBy = vi.fn();
    canvas.scrollBy = scrollBy;
    canvas.getBoundingClientRect = () => ({ top: 0, bottom: 300 }) as DOMRect;

    element.getBoundingClientRect = () => ({ top: 500, bottom: 550 }) as DOMRect;
    scrollCanvasToComponent('a');
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 250 });

    element.getBoundingClientRect = () => ({ top: -80, bottom: -30 }) as DOMRect;
    scrollCanvasToComponent('a');
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -80 });

    scrollBy.mockClear();
    element.getBoundingClientRect = () => ({ top: 100, bottom: 150 }) as DOMRect;
    scrollCanvasToComponent('a');
    expect(scrollBy).not.toHaveBeenCalled();
  });
});
