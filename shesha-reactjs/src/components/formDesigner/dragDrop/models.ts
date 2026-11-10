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
