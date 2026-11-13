/** The canvas drag wrapper's marker; its value is the component id */
const COMPONENT_ID_ATTRIBUTE = 'data-sha-drag-wrapper';
export const LAYER_ROW_ID_ATTRIBUTE = 'data-layer-row-id';
const CANVAS_HOVER_CLASS = 'sha-layers-canvas-hover';
const ROW_CANVAS_HOVER_CLASS = 'is-canvas-hover';
const ROW_FLASH_CLASS = 'is-flashing';
const ROW_FLASH_MS = 600;

const escapeAttributeValue = (value: string): string => value.replace(/["\\]/g, '\\$&');

const findElement = (attribute: string, id: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[${attribute}="${escapeAttributeValue(id)}"]`);

let canvasHighlightId: string | null = null;

const setCanvasOutline = (componentId: string, color: string | null): void => {
  const element = findElement(COMPONENT_ID_ATTRIBUTE, componentId);
  if (element === null)
    return;
  if (color === null) {
    element.classList.remove(CANVAS_HOVER_CLASS);
    element.style.removeProperty('outline');
    element.style.removeProperty('outline-offset');
  } else {
    element.classList.add(CANVAS_HOVER_CLASS);
    element.style.setProperty('outline', `2px dashed ${color}`);
    element.style.setProperty('outline-offset', '2px');
  }
};

/** Outlines a component on the canvas while its row is hovered; null clears it. DOM only, no React renders */
export const highlightComponentOnCanvas = (componentId: string | null, color: string): void => {
  if (canvasHighlightId === componentId)
    return;
  if (canvasHighlightId !== null)
    setCanvasOutline(canvasHighlightId, null);
  canvasHighlightId = componentId;
  if (componentId !== null)
    setCanvasOutline(componentId, color);
};

let rowHighlightId: string | null = null;

/** Called by the canvas: highlights the hovered component's row if it's on screen. Never expands or scrolls the tree */
export const highlightRowFromCanvas = (componentId: string | null): void => {
  if (rowHighlightId === componentId)
    return;
  if (rowHighlightId !== null)
    findElement(LAYER_ROW_ID_ATTRIBUTE, rowHighlightId)?.classList.remove(ROW_CANVAS_HOVER_CLASS);
  rowHighlightId = componentId;
  if (componentId !== null)
    findElement(LAYER_ROW_ID_ATTRIBUTE, componentId)?.classList.add(ROW_CANVAS_HOVER_CLASS);
};

/** The pointer left a component on the canvas */
export const clearRowFromCanvas = (componentId: string): void => {
  if (rowHighlightId === componentId)
    highlightRowFromCanvas(null);
};

/** Briefly flashes a row after a move. Waits a tick so the row has been redrawn first */
export const flashRow = (rowId: string): void => {
  window.setTimeout(() => {
    const element = findElement(LAYER_ROW_ID_ATTRIBUTE, rowId);
    if (element === null)
      return;
    element.classList.add(ROW_FLASH_CLASS);
    window.setTimeout(() => element.classList.remove(ROW_FLASH_CLASS), ROW_FLASH_MS);
  }, 0);
};

/** Scrolls the canvas only as far as needed to show a component */
export const scrollCanvasToComponent = (componentId: string): void => {
  const element = findElement(COMPONENT_ID_ATTRIBUTE, componentId);
  let container = element?.parentElement ?? null;
  while (container !== null && !['auto', 'scroll'].includes(window.getComputedStyle(container).overflowY))
    container = container.parentElement;
  if (element === null || container === null)
    return;
  // up or down only: components are often wider than the canvas, and scrollIntoView would slide it sideways
  const box = element.getBoundingClientRect();
  const view = container.getBoundingClientRect();
  if (box.top < view.top)
    container.scrollBy({ top: box.top - view.top });
  else if (box.bottom > view.bottom)
    container.scrollBy({ top: Math.min(box.bottom - view.bottom, box.top - view.top) });
};
