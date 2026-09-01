import { Cell } from 'react-table';
import { calculatePositionShift } from './datatable';

type TestColumn = Pick<Cell, 'column'>;

const col = (width?: number | string, minWidth?: number): TestColumn => ({ column: { width, minWidth } } as TestColumn);

describe('calculatePositionShift', () => {
  it('returns column widths for the requested range', () => {
    const row = [col(100), col(200), col(300)];
    expect(calculatePositionShift(row, 0, 2)).toEqual([100, 200]);
  });

  it('uses minWidth when width is below it', () => {
    const row = [col(20, 50), col(200, 100)];
    expect(calculatePositionShift(row, 0, 2)).toEqual([50, 200]);
  });

  it('returns an empty array for an empty row, so a summing reduce with seed 0 is safe', () => {
    const shift = calculatePositionShift([], 0, 5).reduce((acc, curr) => acc + curr, 0);
    expect(shift).toBe(0);
  });

  it('excludes the last column when end = length - 1 (matches the anchored shift math)', () => {
    const row = [col(100), col(200), col(300)];
    expect(calculatePositionShift(row, 1, row.length - 1)).toEqual([200]);
  });
});
