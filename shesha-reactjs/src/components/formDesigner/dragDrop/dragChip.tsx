import { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { DRAG_CHIP_INVALID_ATTR, DRAG_CHIP_WARNING_ATTR, DROP_TARGET_LABEL_ATTR, dragChipClassNames } from './models';
import { getChipPosition, IRect } from './chipPlacement';

/** Attribute on a designer component's wrapper holding the component type, used to name it while it is dragged. */
export const COMPONENT_TYPE_ATTR = 'data-sha-component-type';

/** Attribute on the part of the drag chip that says what dropping the item where it is would break. */
export const DRAG_CHIP_ERROR_ATTR = 'data-sha-drag-chip-error';

/** What the drag chip says about dropping the item where it is. */
export interface IDragChipFeedback {
  /** `error`: it can't be dropped there; `warning`: dropping it there needs confirming. */
  severity: 'error' | 'warning';
  /** Shown one per line. */
  messages: string[];
}

interface IDragChip {
  host: HTMLDivElement;
  chip: HTMLDivElement;
  error: HTMLDivElement;
  cleanup: (() => void) | void;
  /** Latest cursor position, applied on the next animation frame. */
  cursor: { x: number; y: number } | null;
  frameRequest: number | null;
  /** The dragged item, drawn as the drop line while it sits in a drop container (see `setDragChipDropMarker`). */
  dropMarker: HTMLElement | null;
}

/** Chip of the drag in progress. */
let current: IDragChip | null = null;

const createElement = (className: string): HTMLDivElement => {
  const element = document.createElement('div');
  element.className = className;
  return element;
};

/** Where the drop line is drawn: the dragged item, while it sits in a drop container and is styled as the line. */
const getDropLineRect = (marker: HTMLElement | null): IRect | null => {
  if (!marker || marker.parentElement?.hasAttribute(DROP_TARGET_LABEL_ATTR) !== true) return null;
  const { left, top, right, bottom } = marker.getBoundingClientRect();
  return { left, top, right, bottom };
};

/**
 * Moves the chip next to the latest cursor position, clear of the cursor and of the drop line (see
 * `getChipPosition`), so the user can always see where the item will land. The only place that writes its position.
 */
const applyCursor = (): void => {
  if (!current) return;
  current.frameRequest = null;
  if (!current.cursor) return;
  const { host, chip, cursor, dropMarker } = current;
  host.hidden = false;
  // read everything before writing, so the frame lays out the page once
  const position = getChipPosition(
    cursor,
    { width: chip.offsetWidth, height: chip.offsetHeight },
    getDropLineRect(dropMarker),
    { width: window.innerWidth, height: window.innerHeight },
  );
  host.style.transform = `translate(${position.x}px, ${position.y}px)`;
};

/**
 * Tells the chip which element shows where the dragged item will land, so it can keep out of its way. SortableJS
 * moves the dragged item itself into the drop container, where it is drawn as the drop line.
 */
export const setDragChipDropMarker = (marker: HTMLElement | null): void => {
  if (current) current.dropMarker = marker;
};

/** `dragover` fires many times per frame, so it only records the position, which is applied once per frame. */
const followCursor = (event: DragEvent): void => {
  if (!current) return;
  current.cursor = { x: event.clientX, y: event.clientY };
  current.frameRequest ??= requestAnimationFrame(applyCursor);
};

/**
 * Removes the chip of the drag in progress, with the listeners it added. Runs when the drag ends (`dragend`, `drop`),
 * when the drop target indicator stops (every designer drag stops it, even when the dragged element left the page
 * and its `dragend` doesn't reach the document) and before a new chip is shown.
 */
export const removeDragChip = (): void => {
  document.removeEventListener('dragover', followCursor, true);
  document.removeEventListener('dragend', removeDragChip, true);
  document.removeEventListener('drop', removeDragChip, true);
  if (!current) return;
  const { host, cleanup, frameRequest } = current;
  current = null;
  if (frameRequest !== null) cancelAnimationFrame(frameRequest);
  host.remove();
  // a React root can't be unmounted while React is rendering, which a drop may be in the middle of
  if (cleanup) setTimeout(cleanup, 0);
};

/**
 * Shows what dropping the dragged item where it is would break, below its icon and name, or clears it when called
 * without feedback.
 */
export const setDragChipFeedback = (feedback: IDragChipFeedback | undefined): void => {
  if (!current) return;
  const { chip, error } = current;
  const messages = feedback?.messages.filter((message) => message !== '') ?? [];
  const severity = messages.length > 0 ? feedback?.severity : undefined;
  error.textContent = messages.join('\n');
  error.hidden = severity === undefined;
  chip.toggleAttribute(DRAG_CHIP_INVALID_ATTR, severity === 'error');
  chip.toggleAttribute(DRAG_CHIP_WARNING_ATTR, severity === 'warning');
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

  const host = createElement(dragChipClassNames.host);
  host.setAttribute('data-sha-drag-chip', '');
  // shown at the cursor once the drag first moves
  host.hidden = true;
  const chip = createElement(dragChipClassNames.chip);
  const content = createElement(dragChipClassNames.content);
  const error = createElement(dragChipClassNames.error);
  error.setAttribute(DRAG_CHIP_ERROR_ATTR, '');
  error.setAttribute('role', 'status');
  error.setAttribute('aria-live', 'polite');
  error.hidden = true;
  chip.append(content, error);
  host.appendChild(chip);
  document.body.appendChild(host);

  current = { host, chip, error, cleanup: fill(content), cursor: null, frameRequest: null, dropMarker: null };
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
