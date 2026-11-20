import { DRAG_CHIP_INVALID_ATTR, DROP_TARGET_LABEL_ATTR } from './models';
import { DRAG_CHIP_ERROR_ATTR, removeDragChip, setComponentDragImage, setDragChipDropMarker, setDragChipError, setItemDragImage } from './dragChip';

interface IFakeDataTransfer {
  dataTransfer: DataTransfer;
  setDragImage: ReturnType<typeof vi.fn>;
  setData: ReturnType<typeof vi.fn>;
}

const fakeDataTransfer = (): IFakeDataTransfer => {
  const setDragImage = vi.fn();
  const setData = vi.fn();
  return { dataTransfer: { setDragImage, setData } as unknown as DataTransfer, setDragImage, setData };
};

const getHost = (): HTMLElement | null => document.querySelector('[data-sha-drag-chip]');
const getChip = (): HTMLElement => getHost()?.firstElementChild as HTMLElement;
const getError = (): HTMLElement | null => document.querySelector(`[${DRAG_CHIP_ERROR_ATTR}]`);
const flushFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));
const dragOver = (clientX: number, clientY: number): void => {
  const event = new Event('dragover') as DragEvent;
  Object.assign(event, { clientX, clientY });
  document.dispatchEvent(event);
};

describe('dragChip', () => {
  afterEach(() => {
    removeDragChip();
    document.body.innerHTML = '';
  });

  it('shows the icon and name of an existing component instead of the component itself', () => {
    const { dataTransfer, setDragImage } = fakeDataTransfer();

    setComponentDragImage(dataTransfer, <svg data-testid="icon" />, 'Text');

    expect(setDragImage).toHaveBeenCalledTimes(1);
    expect(getChip().textContent).toBe('Text');
    expect(getChip().querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('hides the browser drag image, which cannot change during the drag', () => {
    const { dataTransfer, setDragImage } = fakeDataTransfer();

    setComponentDragImage(dataTransfer, null, 'Text');

    const image = setDragImage.mock.calls[0]?.[0] as HTMLElement;
    expect(image).not.toBe(getHost());
    expect(image.childElementCount).toBe(0);
  });

  it('copies the icon and title of a toolbox item, without its info icon', () => {
    const item = document.createElement('div');
    item.innerHTML = '<div><span class="anticon icon"></span><div><span>Text</span><span class="anticon anticon-info-circle"></span></div></div>';
    const { dataTransfer } = fakeDataTransfer();

    setItemDragImage(dataTransfer, item);

    expect(getChip().textContent).toBe('Text');
    expect(getChip().querySelector('.icon')).not.toBeNull();
    expect(getChip().querySelector('.anticon-info-circle')).toBeNull();
  });

  it('copies the icon and title of a data source item', () => {
    const item = document.createElement('div');
    item.innerHTML = '<span class="anticon icon"></span><div>First name</div>';
    const { dataTransfer } = fakeDataTransfer();

    setItemDragImage(dataTransfer, item);

    expect(getChip().textContent).toBe('First name');
    expect(getChip().querySelector('.icon')).not.toBeNull();
  });

  it('sets drag data before the drag image, as SortableJS would', () => {
    const { dataTransfer, setDragImage, setData } = fakeDataTransfer();

    setComponentDragImage(dataTransfer, null, 'Text');

    expect(setData).toHaveBeenCalledWith('Text', 'Text');
    expect(setData.mock.invocationCallOrder[0]).toBeLessThan(setDragImage.mock.invocationCallOrder[0] ?? 0);
  });

  it('still sets drag data without drag image support, but adds no chip', () => {
    const setData = vi.fn();

    setComponentDragImage({ setData } as unknown as DataTransfer, null, 'Text');

    expect(setData).toHaveBeenCalledWith('Text', 'Text');
    expect(document.body.childElementCount).toBe(0);
  });

  it('still sets an item\'s drag data without drag image support', () => {
    const setData = vi.fn();
    const item = document.createElement('div');
    item.innerHTML = '<span>First name</span>';

    setItemDragImage({ setData } as unknown as DataTransfer, item);

    expect(setData).toHaveBeenCalledWith('Text', 'First name');
    expect(document.body.childElementCount).toBe(0);
  });

  it('follows the cursor once the drag moves, once per frame', async () => {
    setComponentDragImage(fakeDataTransfer().dataTransfer, null, 'Text');
    expect(getHost()?.hidden).toBe(true);

    dragOver(150, 50);
    dragOver(200, 100);
    expect(getHost()?.hidden).toBe(true);
    await flushFrame();

    // below and to the right of the cursor, so the cursor stays visible
    expect(getHost()?.hidden).toBe(false);
    expect(getHost()?.style.transform).toBe('translate(216px, 116px)');
  });

  it('keeps clear of the drop line the dragged item is drawn as', async () => {
    const container = document.createElement('div');
    container.setAttribute(DROP_TARGET_LABEL_ATTR, 'Panel');
    const dragged = document.createElement('div');
    // a horizontal line at y 120, across the container
    dragged.getBoundingClientRect = () => new DOMRect(0, 120, 800, 0);
    container.appendChild(dragged);
    document.body.appendChild(container);

    setComponentDragImage(fakeDataTransfer().dataTransfer, null, 'Text');
    setDragChipDropMarker(dragged);
    dragOver(200, 100);
    await flushFrame();

    // the cursor is above the line, so the chip moves up to sit above it too (jsdom gives it no size)
    expect(getHost()?.style.transform).toBe('translate(216px, 112px)');
  });

  it('shows the error below the name and clears it again', () => {
    setComponentDragImage(fakeDataTransfer().dataTransfer, null, 'Data Table');

    setDragChipError('A Data Table must be placed inside a Data Context.');
    expect(getError()?.textContent).toBe('A Data Table must be placed inside a Data Context.');
    expect(getError()?.hidden).toBe(false);
    expect(getError()?.getAttribute('role')).toBe('status');
    expect(getChip().lastElementChild).toBe(getError());
    expect(getChip().hasAttribute(DRAG_CHIP_INVALID_ATTR)).toBe(true);

    setDragChipError(undefined);
    expect(getError()?.textContent).toBe('');
    expect(getError()?.hidden).toBe(true);
    expect(getChip().hasAttribute(DRAG_CHIP_INVALID_ATTR)).toBe(false);
  });

  it('removes the chip and stops following the cursor when the drag ends', async () => {
    setComponentDragImage(fakeDataTransfer().dataTransfer, null, 'Text');
    const host = getHost();

    document.dispatchEvent(new Event('dragend'));
    dragOver(200, 100);
    await flushFrame();

    expect(getHost()).toBeNull();
    expect(host?.style.transform).toBe('');
  });

  it('replaces the chip of a drag that never ended', () => {
    setComponentDragImage(fakeDataTransfer().dataTransfer, null, 'First');
    setComponentDragImage(fakeDataTransfer().dataTransfer, null, 'Second');

    expect(document.querySelectorAll('[data-sha-drag-chip]')).toHaveLength(1);
    expect(getChip().textContent).toBe('Second');
  });
});
