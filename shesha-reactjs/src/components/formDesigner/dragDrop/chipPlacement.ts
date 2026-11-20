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

const fitsBetween = (start: number, length: number, min: number, max: number): boolean => start >= min && start + length <= max;

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

  // below and to the right of the cursor, or on its other side when that runs off screen
  let x = cursor.x + CHIP_CURSOR_GAP + chip.width <= maxX ? cursor.x + CHIP_CURSOR_GAP : cursor.x - CHIP_CURSOR_GAP - chip.width;
  let y = cursor.y + CHIP_CURSOR_GAP + chip.height <= maxY ? cursor.y + CHIP_CURSOR_GAP : cursor.y - CHIP_CURSOR_GAP - chip.height;

  if (dropLine) {
    const keepClear: IRect = {
      left: dropLine.left - DROP_LINE_CLEARANCE,
      top: dropLine.top - DROP_LINE_CLEARANCE,
      right: dropLine.right + DROP_LINE_CLEARANCE,
      bottom: dropLine.bottom + DROP_LINE_CLEARANCE,
    };

    if (overlaps(rectAt({ x, y }, chip), keepClear)) {
      const isHorizontal = dropLine.right - dropLine.left >= dropLine.bottom - dropLine.top;
      if (isHorizontal) {
        const below = keepClear.bottom;
        const above = keepClear.top - chip.height;
        const cursorBelow = cursor.y >= (dropLine.top + dropLine.bottom) / 2;
        const [preferred, other] = cursorBelow ? [below, above] : [above, below];
        y = fitsBetween(preferred, chip.height, minY, maxY) || !fitsBetween(other, chip.height, minY, maxY) ? preferred : other;
      } else {
        const right = keepClear.right;
        const left = keepClear.left - chip.width;
        const cursorRight = cursor.x >= (dropLine.left + dropLine.right) / 2;
        const [preferred, other] = cursorRight ? [right, left] : [left, right];
        x = fitsBetween(preferred, chip.width, minX, maxX) || !fitsBetween(other, chip.width, minX, maxX) ? preferred : other;
      }
    }
  }

  return { x: clamp(x, minX, maxX - chip.width), y: clamp(y, minY, maxY - chip.height) };
};
