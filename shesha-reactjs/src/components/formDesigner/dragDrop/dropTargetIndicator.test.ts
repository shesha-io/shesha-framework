import { DROP_TARGET_FRAME_ATTR, DROP_TARGET_INVALID_ATTR, DROP_TARGET_LABEL_ATTR, DROP_TARGET_LAYOUT_ATTR } from './models';
import { COMPONENT_TYPE_ATTR, DRAG_CHIP_ERROR_ATTR, setComponentDragImage } from './dragChip';
import { designerClassNames } from '../styles/styles';
import { startDropTargetIndicator, stopDropTargetIndicator } from './dropTargetIndicator';

const getFrame = (): HTMLElement | null => document.querySelector('[data-sha-drop-target-indicator]');
const flushFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

const createContainer = (label: string, rect: { left: number; top: number; width: number; height: number }): HTMLElement => {
  const container = document.createElement('div');
  container.setAttribute(DROP_TARGET_LABEL_ATTR, label);
  container.getBoundingClientRect = () => new DOMRect(rect.left, rect.top, rect.width, rect.height);
  document.body.appendChild(container);
  return container;
};

describe('dropTargetIndicator', () => {
  afterEach(() => {
    stopDropTargetIndicator();
    document.body.innerHTML = '';
  });

  it('outlines and names the container the dragged item sits in', async () => {
    const container = createContainer('Panel', { left: 100, top: 200, width: 300, height: 120 });
    const dragged = document.createElement('div');
    container.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();

    const frame = getFrame();
    expect(frame?.style.display).toBe('block');
    expect(frame?.textContent).toBe('Panel');
    expect(frame?.style.transform).toBe('translate(97px, 197px)');
    expect(frame?.style.width).toBe('306px');
    expect(frame?.style.height).toBe('126px');
  });

  it('follows the dragged item into another container', async () => {
    const first = createContainer('Panel', { left: 20, top: 100, width: 100, height: 100 });
    const second = createContainer('Columns', { left: 20, top: 300, width: 100, height: 100 });
    const dragged = document.createElement('div');
    first.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();
    second.appendChild(dragged);
    document.dispatchEvent(new Event('dragover'));
    await flushFrame();

    expect(getFrame()?.textContent).toBe('Columns');
    expect(getFrame()?.style.transform).toBe('translate(17px, 297px)');
  });

  it('marks a drop target that does not meet the required parent and says why on the drag chip', async () => {
    const valid = createContainer('Data context', { left: 20, top: 100, width: 100, height: 100 });
    valid.setAttribute(COMPONENT_TYPE_ATTR, 'dataContext');
    const invalid = createContainer('Panel', { left: 20, top: 300, width: 100, height: 100 });
    const dragged = document.createElement('div');
    dragged.setAttribute(COMPONENT_TYPE_ATTR, 'datatable');
    invalid.appendChild(dragged);
    const getRequiredParent = (type: string) => (type === 'datatable' ? { types: ['dataContext'], message: 'Needs a Data Context.' } : undefined);

    setComponentDragImage({ setData: vi.fn(), setDragImage: vi.fn() } as unknown as DataTransfer, null, 'Data Table');
    const chipError = (): HTMLElement | null => document.querySelector(`[${DRAG_CHIP_ERROR_ATTR}]`);

    startDropTargetIndicator(dragged, getRequiredParent);
    await flushFrame();
    expect(getFrame()?.textContent).toBe('Panel');
    expect(chipError()?.textContent).toBe('Needs a Data Context.');
    expect(chipError()?.style.display).toBe('block');
    expect(invalid.hasAttribute(DROP_TARGET_INVALID_ATTR)).toBe(true);

    valid.appendChild(dragged);
    document.dispatchEvent(new Event('dragover'));
    await flushFrame();
    expect(getFrame()?.textContent).toBe('Data context');
    expect(chipError()?.textContent).toBe('');
    expect(chipError()?.style.display).toBe('none');
    expect(invalid.hasAttribute(DROP_TARGET_INVALID_ATTR)).toBe(false);
    expect(valid.hasAttribute(DROP_TARGET_INVALID_ATTR)).toBe(false);
  });

  it('frames the whole component that owns the container', async () => {
    const component = document.createElement('div');
    component.className = designerClassNames.shaComponent;
    component.getBoundingClientRect = () => new DOMRect(50, 80, 400, 300);
    document.body.appendChild(component);
    const header = document.createElement('div');
    component.appendChild(header);
    const container = createContainer('Panel', { left: 60, top: 130, width: 380, height: 200 });
    container.setAttribute(DROP_TARGET_FRAME_ATTR, 'component');
    header.appendChild(container);
    const dragged = document.createElement('div');
    container.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();

    expect(getFrame()?.textContent).toBe('Panel');
    expect(getFrame()?.style.transform).toBe('translate(47px, 77px)');
    expect(getFrame()?.style.width).toBe('406px');
  });

  it('keeps the frame inside the scrolling pane the target is shown in', async () => {
    const canvas = document.createElement('div');
    canvas.style.overflow = 'auto';
    canvas.getBoundingClientRect = () => new DOMRect(100, 50, 500, 400);
    document.body.appendChild(canvas);
    const container = createContainer('Form', { left: 120, top: 70, width: 800, height: 600 });
    canvas.appendChild(container);
    const dragged = document.createElement('div');
    container.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();

    const frame = getFrame();
    // left and top fit, right and bottom run under whatever sits beside the canvas
    expect(frame?.style.transform).toBe('translate(117px, 67px)');
    expect(frame?.style.width).toBe('483px');
    expect(frame?.style.height).toBe('383px');
    expect(frame?.style.borderLeftStyle).toBe('dashed');
    expect(frame?.style.borderTopStyle).toBe('dashed');
    expect(frame?.style.borderRightStyle).toBe('none');
    expect(frame?.style.borderBottomStyle).toBe('none');
  });

  it('keeps the border of a side where only the gap around the component is cut off', async () => {
    const canvas = document.createElement('div');
    canvas.style.overflow = 'auto';
    canvas.getBoundingClientRect = () => new DOMRect(100, 50, 500, 400);
    document.body.appendChild(canvas);
    const container = createContainer('Form', { left: 100, top: 50, width: 300, height: 200 });
    canvas.appendChild(container);
    const dragged = document.createElement('div');
    container.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();

    const frame = getFrame();
    expect(frame?.style.transform).toBe('translate(100px, 50px)');
    expect(frame?.style.borderLeftStyle).toBe('dashed');
    expect(frame?.style.borderTopStyle).toBe('dashed');
  });

  it('hides the frame when the target is scrolled out of view', async () => {
    const canvas = document.createElement('div');
    canvas.style.overflow = 'auto';
    canvas.getBoundingClientRect = () => new DOMRect(100, 50, 500, 400);
    document.body.appendChild(canvas);
    const container = createContainer('Panel', { left: 120, top: 600, width: 200, height: 100 });
    canvas.appendChild(container);
    const dragged = document.createElement('div');
    container.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();

    expect(getFrame()?.style.display).toBe('none');
  });

  it('frames only the container when it is a part of the component', async () => {
    const component = document.createElement('div');
    component.className = designerClassNames.shaComponent;
    component.getBoundingClientRect = () => new DOMRect(50, 80, 400, 300);
    document.body.appendChild(component);
    const container = createContainer('Panel › Header', { left: 60, top: 90, width: 380, height: 40 });
    container.setAttribute(DROP_TARGET_FRAME_ATTR, 'container');
    component.appendChild(container);
    const dragged = document.createElement('div');
    container.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();

    expect(getFrame()?.textContent).toBe('Panel › Header');
    expect(getFrame()?.style.transform).toBe('translate(57px, 87px)');
    expect(getFrame()?.style.height).toBe('46px');
  });

  it('does not read layout on dragover while the container is unchanged', async () => {
    const container = createContainer('Panel', { left: 0, top: 100, width: 100, height: 100 });
    const measure = vi.spyOn(container, 'getBoundingClientRect');
    const dragged = document.createElement('div');
    container.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();
    for (let i = 0; i < 10; i++) document.dispatchEvent(new Event('dragover'));
    await flushFrame();

    expect(measure).toHaveBeenCalledTimes(1);
  });

  it('hides while the dragged item is outside every drop container', async () => {
    const dragged = document.createElement('div');
    document.body.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();

    expect(getFrame()?.style.display).toBe('none');
  });

  it('marks a row container so the insertion line is drawn vertically', () => {
    const column = createContainer('Panel', { left: 0, top: 0, width: 100, height: 100 });
    const row = createContainer('Container', { left: 0, top: 200, width: 300, height: 50 });
    row.style.display = 'flex';
    row.style.flexDirection = 'row';
    const dragged = document.createElement('div');
    column.appendChild(dragged);

    startDropTargetIndicator(dragged);
    expect(column.getAttribute(DROP_TARGET_LAYOUT_ATTR)).toBe('vertical');

    row.appendChild(dragged);
    document.dispatchEvent(new Event('dragover'));
    expect(row.getAttribute(DROP_TARGET_LAYOUT_ATTR)).toBe('horizontal');
  });

  it('hides when the drag ends', async () => {
    const container = createContainer('Panel', { left: 0, top: 100, width: 100, height: 100 });
    const dragged = document.createElement('div');
    container.appendChild(dragged);

    startDropTargetIndicator(dragged);
    await flushFrame();
    stopDropTargetIndicator();

    expect(getFrame()?.style.display).toBe('none');
  });
});
