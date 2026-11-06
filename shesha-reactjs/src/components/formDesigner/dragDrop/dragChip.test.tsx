import { setComponentDragImage, setItemDragImage } from './dragChip';

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

const chipOf = (image: unknown): HTMLElement => (image as HTMLElement).firstElementChild as HTMLElement;

describe('dragChip', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows the icon and name of an existing component instead of the component itself', () => {
    const { dataTransfer, setDragImage } = fakeDataTransfer();

    setComponentDragImage(dataTransfer, <svg data-testid="icon" />, 'Text');

    expect(setDragImage).toHaveBeenCalledTimes(1);
    const chip = chipOf(setDragImage.mock.calls[0]?.[0]);
    expect(chip.textContent).toBe('Text');
    expect(chip.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('copies the icon and title of a toolbox item, without its info icon', () => {
    const item = document.createElement('div');
    item.innerHTML = '<div><span class="anticon icon"></span><div><span>Text</span><span class="anticon anticon-info-circle"></span></div></div>';
    const { dataTransfer, setDragImage } = fakeDataTransfer();

    setItemDragImage(dataTransfer, item);

    const chip = chipOf(setDragImage.mock.calls[0]?.[0]);
    expect(chip.textContent).toBe('Text');
    expect(chip.querySelector('.icon')).not.toBeNull();
    expect(chip.querySelector('.anticon-info-circle')).toBeNull();
  });

  it('copies the icon and title of a data source item', () => {
    const item = document.createElement('div');
    item.innerHTML = '<span class="anticon icon"></span><div>First name</div>';
    const { dataTransfer, setDragImage } = fakeDataTransfer();

    setItemDragImage(dataTransfer, item);

    const chip = chipOf(setDragImage.mock.calls[0]?.[0]);
    expect(chip.textContent).toBe('First name');
    expect(chip.querySelector('.icon')).not.toBeNull();
  });

  it('sets drag data before the drag image, as SortableJS would', () => {
    const { dataTransfer, setDragImage, setData } = fakeDataTransfer();

    setComponentDragImage(dataTransfer, null, 'Text');

    expect(setData).toHaveBeenCalledWith('Text', 'Text');
    expect(setData.mock.invocationCallOrder[0]).toBeLessThan(setDragImage.mock.invocationCallOrder[0] ?? 0);
  });

  it('does nothing without drag image support', () => {
    const setData = vi.fn();

    setComponentDragImage({ setData } as unknown as DataTransfer, null, 'Text');

    expect(setData).not.toHaveBeenCalled();
    expect(document.body.childElementCount).toBe(0);
  });

  it('removes the chip once the browser has captured it', async () => {
    const { dataTransfer } = fakeDataTransfer();

    setComponentDragImage(dataTransfer, null, 'Text');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.body.childElementCount).toBe(0);
  });
});
