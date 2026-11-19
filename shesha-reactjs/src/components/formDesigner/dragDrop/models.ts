/** Attribute that marks the element of a designer drop container and holds the name shown while dropping into it. */
export const DROP_TARGET_LABEL_ATTR = 'data-sha-drop-label';
/** Attribute that holds the direction a designer drop container declares in its settings. */
export const DROP_TARGET_DIRECTION_ATTR = 'data-sha-drop-direction';
/**
 * Attribute set while dragging to the direction the container's items are actually laid out in (see
 * `getDropDirection`), so the insertion line is drawn across that direction: vertical between items in a row,
 * horizontal between items in a column.
 */
export const DROP_TARGET_LAYOUT_ATTR: string = 'data-sha-drop-layout';
/** Attribute that says whether the highlight frame goes around the owning component or only the container. */
export const DROP_TARGET_FRAME_ATTR: string = 'data-sha-drop-frame';
/**
 * Attribute set while dragging on a drop container the dragged item can't be dropped into, e.g. a Data Table outside a
 * Data Context, so the insertion line and the highlight frame are drawn in the error colour.
 */
export const DROP_TARGET_INVALID_ATTR: string = 'data-sha-drop-invalid';

/** Class names of the drag chip, styled with the theme by `DragChipGlobalStyles`. */
export const dragChipClassNames = {
  host: 'sha-drag-chip-host',
  chip: 'sha-drag-chip',
  content: 'sha-drag-chip-content',
  error: 'sha-drag-chip-error',
};
/** Attribute set on the drag chip while the dragged item can't be dropped where it is. */
export const DRAG_CHIP_INVALID_ATTR: string = 'data-sha-drag-chip-invalid';
