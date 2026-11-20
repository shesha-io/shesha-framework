/** Gap between the cursor and the chip, which sits below and to the right of it so the cursor stays visible. */
export const CHIP_CURSOR_GAP = 16;
/** Room kept clear on each side of the drop line, so the chip never touches it. */
export const DROP_LINE_CLEARANCE = 8;
/** Room kept between the chip and the edges of the window. */
const VIEWPORT_MARGIN = 4;

export interface IPoint { x: number; y: number }
export interface ISize { width: number; height: number }
export interface IRect { left: number; top: number; right: number; bottom: number }

const overlaps = (a: IRect, b: IRect): boolean => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, Math.max(min, max)));

const rectAt = (position: IPoint, size: ISize): IRect =>
  ({ left: position.x, top: position.y, right: position.x + size.width, bottom: position.y + size.height });

const containsPoint = (rect: IRect, point: IPoint): boolean =>
  point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;

/** The spot after the line (below or right of it) first when `afterFirst`, otherwise the one before it. */
const sidesFirst = (afterFirst: boolean, after: IPoint, before: IPoint): [IPoint, IPoint] => (afterFirst ? [after, before] : [before, after]);

/**
 * Works out where the drag chip goes: next to the cursor, never over it, and never over the line that shows where the
 * dragged item will be dropped. A horizontal line runs across its container, so the chip moves above or below it; a
 * vertical line runs down its container, so the chip moves to its left or right. It stays on the cursor's side of the
 * line when there is room there, and on screen.
 *
 * @param dropLine where the drop line is drawn, or `null` while the item isn't over a drop container
 */
export const getChipPosition = (cursor: IPoint, chip: ISize, dropLine: IRect | null, viewport: ISize): IPoint => {
  const minX = VIEWPORT_MARGIN;
  const minY = VIEWPORT_MARGIN;
  const maxX = viewport.width - VIEWPORT_MARGIN;
  const maxY = viewport.height - VIEWPORT_MARGIN;

  // the window may be too small for a spot to fit, so every spot is checked where it ends up, after being kept on screen
  const place = (position: IPoint): IPoint =>
    ({ x: clamp(position.x, minX, maxX - chip.width), y: clamp(position.y, minY, maxY - chip.height) });

  // below and to the right of the cursor, or on its other side when that runs off screen
  const initial = place({
    x: cursor.x + CHIP_CURSOR_GAP + chip.width <= maxX ? cursor.x + CHIP_CURSOR_GAP : cursor.x - CHIP_CURSOR_GAP - chip.width,
    y: cursor.y + CHIP_CURSOR_GAP + chip.height <= maxY ? cursor.y + CHIP_CURSOR_GAP : cursor.y - CHIP_CURSOR_GAP - chip.height,
  });
  if (!dropLine) return initial;

  const keepClear: IRect = {
    left: dropLine.left - DROP_LINE_CLEARANCE,
    top: dropLine.top - DROP_LINE_CLEARANCE,
    right: dropLine.right + DROP_LINE_CLEARANCE,
    bottom: dropLine.bottom + DROP_LINE_CLEARANCE,
  };
  const coversLine = (position: IPoint): boolean => overlaps(rectAt(position, chip), keepClear);
  const isClear = (position: IPoint): boolean => !coversLine(position) && !containsPoint(rectAt(position, chip), cursor);

  // on the cursor's side of the line first, then on the other side
  const isHorizontal = dropLine.right - dropLine.left >= dropLine.bottom - dropLine.top;
  const [preferred, other] = isHorizontal
    ? sidesFirst(cursor.y >= (dropLine.top + dropLine.bottom) / 2, { ...initial, y: keepClear.bottom }, { ...initial, y: keepClear.top - chip.height })
    : sidesFirst(cursor.x >= (dropLine.left + dropLine.right) / 2, { ...initial, x: keepClear.right }, { ...initial, x: keepClear.left - chip.width });
  const onCursorSide = place(preferred);
  const candidates = [initial, onCursorSide, place(other)];

  // when nothing is clear of both, seeing the line matters most
  return candidates.find(isClear) ?? candidates.find((position) => !coversLine(position)) ?? onCursorSide;
};
