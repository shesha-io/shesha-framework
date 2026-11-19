import { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

/** Attribute on a designer component's wrapper holding the component type, used to name it while it is dragged. */
export const COMPONENT_TYPE_ATTR = 'data-sha-component-type';

/** Attribute on the line of the drag chip that says why the item can't be dropped where it is. */
export const DRAG_CHIP_ERROR_ATTR = 'data-sha-drag-chip-error';

/** Offset of the cursor from the chip's top-left corner. */
const CURSOR_OFFSET = { x: 14, y: 14 };
/** Colour of the chip's border and error line while the item can't be dropped where it is. */
const ERROR_COLOR = '#ff4d4f';
const BORDER_COLOR = 'rgba(0, 0, 0, 0.06)';

const CHIP_STYLE: Partial<CSSStyleDeclaration> = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '2px',
  padding: '4px 10px',
  borderRadius: '6px',
  border: `1px solid ${BORDER_COLOR}`,
  background: '#fff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  color: 'rgba(0, 0, 0, 0.88)',
  fontSize: '13px',
  fontWeight: '500',
  lineHeight: '20px',
  whiteSpace: 'nowrap',
};

const CONTENT_STYLE: Partial<CSSStyleDeclaration> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const ERROR_STYLE: Partial<CSSStyleDeclaration> = {
  display: 'none',
  maxWidth: '280px',
  color: ERROR_COLOR,
  fontSize: '12px',
  fontWeight: '400',
  lineHeight: '18px',
  whiteSpace: 'normal',
};

interface IDragChip {
  host: HTMLDivElement;
  chip: HTMLDivElement;
  error: HTMLDivElement;
  cleanup: (() => void) | void;
}

/** Chip of the drag in progress. */
let current: IDragChip | null = null;

const followCursor = (event: DragEvent): void => {
  if (!current) return;
  current.host.style.display = 'block';
  current.host.style.transform = `translate(${event.clientX - CURSOR_OFFSET.x}px, ${event.clientY - CURSOR_OFFSET.y}px)`;
};

/** Removes the chip of the drag in progress. Runs when the drag ends, and when the drop target indicator stops. */
export const removeDragChip = (): void => {
  document.removeEventListener('dragover', followCursor, true);
  document.removeEventListener('dragend', removeDragChip, true);
  document.removeEventListener('drop', removeDragChip, true);
  if (!current) return;
  const { host, cleanup } = current;
  current = null;
  host.remove();
  // a React root can't be unmounted while React is rendering, which a drop may be in the middle of
  if (cleanup) setTimeout(cleanup, 0);
};

/**
 * Shows why the dragged item can't be dropped where it is, below its icon and name, or clears the reason when called
 * without one.
 */
export const setDragChipError = (message: string | undefined): void => {
  if (!current) return;
  const { chip, error } = current;
  const hasError = message !== undefined && message !== '';
  error.textContent = hasError ? message : '';
  error.style.display = hasError ? 'block' : 'none';
  chip.style.borderColor = hasError ? ERROR_COLOR : BORDER_COLOR;
};

/**
 * Hides the browser's drag image, which is a snapshot taken during `dragstart` that can't change afterwards. The chip
 * is drawn on the page instead and follows the cursor, so it can show why the item can't be dropped where it is.
 */
const hideNativeDragImage = (dataTransfer: DataTransfer): void => {
  const blank = document.createElement('div');
  Object.assign(blank.style, { position: 'fixed', top: '0', left: '-10000px', width: '1px', height: '1px' });
  document.body.appendChild(blank);
  dataTransfer.setDragImage(blank, 0, 0);
  // the browser captures the image during dragstart, so the element only has to exist for that moment
  setTimeout(() => blank.remove(), 0);
};

/** Shows a chip filled by `fill` next to the cursor instead of the browser's snapshot of the dragged element. */
const showChip = (dataTransfer: DataTransfer | null, text: string, fill: (content: HTMLDivElement) => (() => void) | void): void => {
  if (!dataTransfer) return;

  // this replaces SortableJS' own setData, which sets the drag data; some browsers (Firefox) don't start a drag without
  // it, so it is set even when the custom drag image can't be
  dataTransfer.setData('Text', text);

  if (typeof dataTransfer.setDragImage !== 'function') return;

  removeDragChip();

  const host = document.createElement('div');
  host.setAttribute('data-sha-drag-chip', '');
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    display: 'none',
    pointerEvents: 'none',
    zIndex: '10001',
    fontFamily: 'inherit',
    willChange: 'transform',
  });
  const chip = document.createElement('div');
  Object.assign(chip.style, CHIP_STYLE);
  const content = document.createElement('div');
  Object.assign(content.style, CONTENT_STYLE);
  const error = document.createElement('div');
  error.setAttribute(DRAG_CHIP_ERROR_ATTR, '');
  Object.assign(error.style, ERROR_STYLE);
  chip.append(content, error);
  host.appendChild(chip);
  document.body.appendChild(host);

  current = { host, chip, error, cleanup: fill(content) };
  hideNativeDragImage(dataTransfer);

  document.addEventListener('dragover', followCursor, true);
  document.addEventListener('dragend', removeDragChip, true);
  document.addEventListener('drop', removeDragChip, true);
};

/** Drag image for a component already on the canvas: its toolbox icon and name. */
export const setComponentDragImage = (dataTransfer: DataTransfer | null, icon: ReactNode, name: string): void => {
  showChip(dataTransfer, name, (content) => {
    const root = createRoot(content);
    flushSync(() => {
      root.render(<>{icon}<span>{name}</span></>);
    });
    return () => root.unmount();
  });
};

/** Drag image for a toolbox or data source item: a copy of the item's own icon and title. */
export const setItemDragImage = (dataTransfer: DataTransfer | null, item: HTMLElement): void => {
  // toolbox items wrap their icon and title in a single element, data source items hold them directly
  const content = item.childElementCount === 1 && item.firstElementChild ? item.firstElementChild : item;
  showChip(dataTransfer, content.textContent, (chipContent) => {
    Array.from(content.childNodes).forEach((node) => chipContent.appendChild(node.cloneNode(true)));
    // the toolbox info icon only makes sense next to the toolbox item
    chipContent.querySelectorAll('.anticon-info-circle').forEach((icon) => icon.remove());
  });
};
