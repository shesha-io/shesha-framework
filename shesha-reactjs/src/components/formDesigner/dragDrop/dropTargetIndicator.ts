import { designerClassNames } from '../styles/styles';
import { DROP_TARGET_FRAME_ATTR, DROP_TARGET_LABEL_ATTR, DROP_TARGET_LAYOUT_ATTR } from './models';
import { getDropDirection } from './dropDirection';

/** Height of the name drawn above the highlighted component. */
const LABEL_HEIGHT = 18;
/** Gap between the component and the highlight frame drawn around it. */
const FRAME_OFFSET = 3;
/** Used until the insertion line has been rendered and its colour can be read. */
const FALLBACK_COLOR = '#1677ff';
/** Small component glyph shown before the name, drawn with the current text colour. */
const LABEL_ICON = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5"/><path d="M1.5 5h9"/></svg>';

interface IIndicatorElements {
  frame: HTMLDivElement;
  label: HTMLDivElement;
  labelText: HTMLSpanElement;
}

let elements: IIndicatorElements | null = null;
let draggedElement: HTMLElement | null = null;
/** Drop container the dragged item currently sits in. */
let currentContainer: HTMLElement | null = null;
/** Element the frame is drawn around: the whole component that owns the container, or the container itself. */
let currentTarget: HTMLElement | null = null;
/** Ancestors of the target that clip it (scrolling panes such as the designer canvas), resolved on first measure. */
let clipAncestors: HTMLElement[] | null = null;
let resizeObserver: ResizeObserver | null = null;
let frameRequest: number | null = null;
let colorResolved = false;

const createElements = (): IIndicatorElements => {
  const frame = document.createElement('div');
  frame.setAttribute('data-sha-drop-target-indicator', '');
  Object.assign(frame.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    pointerEvents: 'none',
    zIndex: '10000',
    boxSizing: 'border-box',
    borderRadius: '4px',
    display: 'none',
    willChange: 'transform',
  });

  const label = document.createElement('div');
  Object.assign(label.style, {
    position: 'absolute',
    left: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: `${LABEL_HEIGHT}px`,
    padding: '0 4px',
    borderRadius: '3px',
    fontSize: '12px',
    lineHeight: `${LABEL_HEIGHT}px`,
    whiteSpace: 'nowrap',
    background: 'rgba(255, 255, 255, 0.92)',
  });
  label.innerHTML = LABEL_ICON;

  const labelText = document.createElement('span');
  label.appendChild(labelText);

  frame.appendChild(label);
  document.body.appendChild(frame);
  return { frame, label, labelText };
};

const setColor = (color: string): void => {
  if (!elements) return;
  elements.frame.style.border = `1.5px dashed ${color}`;
  elements.label.style.color = color;
};

/** The insertion line is styled with the theme's primary colour, so the frame borrows it from there. */
const resolveColor = (): void => {
  if (colorResolved || !draggedElement) return;
  const color = getComputedStyle(draggedElement, '::before').backgroundColor;
  if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
    setColor(color);
    colorResolved = true;
  }
};

const findClipAncestors = (element: HTMLElement): HTMLElement[] => {
  const result: HTMLElement[] = [];
  for (let node = element.parentElement; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
    const { overflow, overflowX, overflowY } = getComputedStyle(node);
    if ([overflow, overflowX, overflowY].some((value) => Boolean(value) && value !== 'visible')) result.push(node);
  }
  return result;
};

interface IBox { left: number; top: number; right: number; bottom: number }

/**
 * Area the target can be seen in: the viewport narrowed down by every scrolling ancestor. The frame is a fixed layer
 * on top of the page, so without this it would be drawn over whatever covers the hidden part of the target, such as
 * the properties panel next to the canvas.
 */
const getVisibleArea = (ancestors: HTMLElement[]): IBox => {
  const area: IBox = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  ancestors.forEach((ancestor) => {
    const rect = ancestor.getBoundingClientRect();
    area.left = Math.max(area.left, rect.left);
    area.top = Math.max(area.top, rect.top);
    area.right = Math.min(area.right, rect.right);
    area.bottom = Math.min(area.bottom, rect.bottom);
  });
  return area;
};

/** Positions the frame over the current target. The only place that reads layout. */
const measure = (): void => {
  frameRequest = null;
  if (!elements || !currentTarget) return;

  resolveColor();
  clipAncestors ??= findClipAncestors(currentTarget);

  const rect = currentTarget.getBoundingClientRect();
  const wanted: IBox = {
    left: rect.left - FRAME_OFFSET,
    top: rect.top - FRAME_OFFSET,
    right: rect.right + FRAME_OFFSET,
    bottom: rect.bottom + FRAME_OFFSET,
  };
  const visible = getVisibleArea(clipAncestors);
  const box: IBox = {
    left: Math.max(wanted.left, visible.left),
    top: Math.max(wanted.top, visible.top),
    right: Math.min(wanted.right, visible.right),
    bottom: Math.min(wanted.bottom, visible.bottom),
  };

  const { frame, label } = elements;
  if (box.right <= box.left || box.bottom <= box.top) {
    frame.style.display = 'none';
    return;
  }

  // a clipped side carries on out of view, so it gets no border instead of a fake edge
  const side = (clipped: boolean): string => (clipped ? 'none' : 'dashed');
  Object.assign(frame.style, {
    display: 'block',
    transform: `translate(${box.left}px, ${box.top}px)`,
    width: `${box.right - box.left}px`,
    height: `${box.bottom - box.top}px`,
    // only the component running out of view counts, losing just the gap around it still gets a border
    borderLeftStyle: side(rect.left < visible.left),
    borderTopStyle: side(rect.top < visible.top),
    borderRightStyle: side(rect.right > visible.right),
    borderBottomStyle: side(rect.bottom > visible.bottom),
  });

  // the name sits above the frame, or just inside it when there is no visible room above
  label.style.top = box.top - LABEL_HEIGHT - 2 >= visible.top ? `-${LABEL_HEIGHT + 2}px` : '2px';
};

const scheduleMeasure = (): void => {
  if (frameRequest === null) frameRequest = requestAnimationFrame(measure);
};

/**
 * Dropping into a component's main area (e.g. a Panel's body) frames the whole component, header included. Dropping
 * into one of its parts (a Panel's header, one of several columns) frames only that part, so the two can be told apart.
 */
const getHighlightTarget = (container: HTMLElement): HTMLElement => {
  if (container.getAttribute(DROP_TARGET_FRAME_ATTR) !== 'component') return container;
  const owner = container.parentElement?.closest<HTMLElement>(`.${designerClassNames.shaComponent}`);
  return owner ?? container;
};

/**
 * SortableJS moves the dragged element into the container it will be dropped into, so its parent is the drop target.
 * Runs on every dragover, so it only compares elements and attributes; styles are read only when the container changes.
 */
const trackContainer = (): void => {
  if (!elements || !draggedElement) return;

  const parent = draggedElement.parentElement;
  const container = parent?.hasAttribute(DROP_TARGET_LABEL_ATTR) === true ? parent : null;
  if (container === currentContainer) return;

  // the insertion line runs across the container's layout, so it is vertical between the items of a row
  container?.setAttribute(DROP_TARGET_LAYOUT_ATTR, getDropDirection(container));

  if (currentTarget) resizeObserver?.unobserve(currentTarget);
  currentContainer = container;
  currentTarget = container ? getHighlightTarget(container) : null;
  clipAncestors = null;

  if (!container || !currentTarget) {
    elements.frame.style.display = 'none';
    return;
  }

  elements.labelText.textContent = container.getAttribute(DROP_TARGET_LABEL_ATTR);
  resizeObserver?.observe(currentTarget);
  scheduleMeasure();
};

/** Starts highlighting the drop target of `dragged` until `stopDropTargetIndicator` is called. */
export const startDropTargetIndicator = (dragged: HTMLElement): void => {
  if (!elements?.frame.isConnected) elements = createElements();
  draggedElement = dragged;
  currentContainer = null;
  currentTarget = null;
  clipAncestors = null;
  colorResolved = false;
  setColor(FALLBACK_COLOR);

  resizeObserver ??= typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleMeasure);

  document.addEventListener('dragover', trackContainer, true);
  document.addEventListener('scroll', scheduleMeasure, true);
  window.addEventListener('resize', scheduleMeasure);
  trackContainer();
};

export const stopDropTargetIndicator = (): void => {
  document.removeEventListener('dragover', trackContainer, true);
  document.removeEventListener('scroll', scheduleMeasure, true);
  window.removeEventListener('resize', scheduleMeasure);
  resizeObserver?.disconnect();
  if (frameRequest !== null) cancelAnimationFrame(frameRequest);
  frameRequest = null;
  draggedElement = null;
  currentContainer = null;
  currentTarget = null;
  if (elements) elements.frame.style.display = 'none';
};
