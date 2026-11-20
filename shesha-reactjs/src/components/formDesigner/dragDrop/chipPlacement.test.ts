import { CHIP_CURSOR_GAP, DROP_LINE_CLEARANCE, getChipPosition, IPoint, IRect, ISize } from './chipPlacement';

const viewport: ISize = { width: 1000, height: 800 };
const chip: ISize = { width: 120, height: 30 };

const chipRect = (position: IPoint): IRect =>
  ({ left: position.x, top: position.y, right: position.x + chip.width, bottom: position.y + chip.height });
const overlaps = (a: IRect, b: IRect): boolean => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const containsPoint = (rect: IRect, point: IPoint): boolean =>
  point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;

/** A horizontal drop line between two items of a column, across the container from x 100 to 700. */
const horizontalLine = (y: number): IRect => ({ left: 100, top: y, right: 700, bottom: y });
/** A vertical drop line between two items of a row, down the container from y 100 to 500. */
const verticalLine = (x: number): IRect => ({ left: x, top: 100, right: x, bottom: 500 });

describe('getChipPosition', () => {
  it('sits below and to the right of the cursor, clear of it', () => {
    const cursor = { x: 200, y: 200 };
    const position = getChipPosition(cursor, chip, null, viewport);
    expect(position).toEqual({ x: 200 + CHIP_CURSOR_GAP, y: 200 + CHIP_CURSOR_GAP });
    expect(containsPoint(chipRect(position), cursor)).toBe(false);
  });

  it('flips to the other side of the cursor near the right and bottom edges', () => {
    const cursor = { x: 950, y: 780 };
    const position = getChipPosition(cursor, chip, null, viewport);
    expect(position).toEqual({ x: 950 - CHIP_CURSOR_GAP - chip.width, y: 780 - CHIP_CURSOR_GAP - chip.height });
  });

  it('moves above a horizontal line the cursor is above', () => {
    const line = horizontalLine(220);
    const position = getChipPosition({ x: 300, y: 210 }, chip, line, viewport);
    expect(position.y).toBe(220 - DROP_LINE_CLEARANCE - chip.height);
    expect(overlaps(chipRect(position), line)).toBe(false);
  });

  it('moves below a horizontal line the cursor is below, when the bottom edge put it above the cursor', () => {
    // near the bottom the chip goes above the cursor, which would put it over the line
    const line = horizontalLine(740);
    const position = getChipPosition({ x: 300, y: 765 }, chip, line, viewport);
    expect(position.y).toBe(740 + DROP_LINE_CLEARANCE);
    expect(overlaps(chipRect(position), line)).toBe(false);
  });

  it('moves beside a vertical line it would cross, on the cursor\'s side', () => {
    const line = verticalLine(220);
    const position = getChipPosition({ x: 210, y: 200 }, chip, line, viewport);
    expect(position.x).toBe(220 - DROP_LINE_CLEARANCE - chip.width);
    expect(overlaps(chipRect(position), line)).toBe(false);
  });

  it('goes to the other side of the line when its own side runs off screen', () => {
    const line = horizontalLine(20);
    const position = getChipPosition({ x: 300, y: 10 }, chip, line, viewport);
    expect(position.y).toBe(20 + DROP_LINE_CLEARANCE);
  });

  it('stays where it is when it is already clear of the line', () => {
    const line = horizontalLine(500);
    expect(getChipPosition({ x: 300, y: 200 }, chip, line, viewport)).toEqual({ x: 300 + CHIP_CURSOR_GAP, y: 200 + CHIP_CURSOR_GAP });
  });

  it('checks where the chip ends up once kept on screen, and uses the other side of the line when that is clear', () => {
    // too narrow for the chip beside the cursor, so it is pushed back over it; above the line it would cover the cursor
    const narrow: ISize = { width: 200, height: 800 };
    const line: IRect = { left: 0, top: 300, right: 200, bottom: 300 };
    const cursor = { x: 100, y: 290 };
    const position = getChipPosition(cursor, chip, line, narrow);
    expect(position).toEqual({ x: 4, y: 300 + DROP_LINE_CLEARANCE });
    expect(containsPoint(chipRect(position), cursor)).toBe(false);
    expect(overlaps(chipRect(position), line)).toBe(false);
  });

  it('keeps the line in view when nothing is clear of both the line and the cursor', () => {
    // a window so small the chip can't avoid the cursor anywhere, but it still keeps off the line
    const tiny: ISize = { width: 130, height: 90 };
    const line: IRect = { left: 0, top: 20, right: 130, bottom: 20 };
    const position = getChipPosition({ x: 65, y: 50 }, chip, line, tiny);
    expect(position).toEqual({ x: 4, y: 20 + DROP_LINE_CLEARANCE });
    expect(overlaps(chipRect(position), line)).toBe(false);
  });

  it('never covers the cursor or the line, wherever the cursor is around it', () => {
    const lines = [horizontalLine(300), verticalLine(300)];
    for (const line of lines) {
      for (let dx = -30; dx <= 30; dx += 5) {
        for (let dy = -30; dy <= 30; dy += 5) {
          const cursor = { x: 300 + dx, y: 300 + dy };
          const rect = chipRect(getChipPosition(cursor, chip, line, viewport));
          expect(overlaps(rect, line)).toBe(false);
          expect(containsPoint(rect, cursor)).toBe(false);
        }
      }
    }
  });
});
