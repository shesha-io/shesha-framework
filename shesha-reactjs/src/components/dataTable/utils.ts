import { isPropertySettings } from '@/designer-components/_settings/utils/utils';
import { CellStyleFunc, IAnchoredColumnProps, ITableColumn } from '@/providers/dataTable/interfaces';
import { FunctionExecutor, getFunctionExecutor } from '@/providers/form/utils';
import { calculatePositionShift, calculateTotalColumnsOnFixed, getColumnAnchored, getConfigurableColumn } from '@/utils/datatable';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { Cell } from 'react-table';

export const getCellStyleAccessor = (columnItem: ITableColumn): CellStyleFunc => {
  const backgroundSetting = isPropertySettings<string>(columnItem.backgroundColor)
    ? columnItem.backgroundColor
    : undefined;

  const backgroundColorAccessor: FunctionExecutor<string | undefined> = backgroundSetting
    ? backgroundSetting._mode === 'value'
      ? () => backgroundSetting._value
      : !isNullOrWhiteSpace(backgroundSetting._code)
        ? getFunctionExecutor(backgroundSetting._code, [{ name: 'row' }, { name: 'value' }])
        : () => undefined
    : () => typeof columnItem.backgroundColor === 'string'
      ? columnItem.backgroundColor
      : undefined;

  const cellStyleAccessor: CellStyleFunc = ({ row, value }) => {
    const background = backgroundColorAccessor(row, value);
    return !isNullOrWhiteSpace(background)
      ? { backgroundColor: background }
      : {};
  };
  return cellStyleAccessor;
};

export const getAnchoredCellStyleAccessor = <D extends object = object>(
  row: Cell<D>[],
  cell: Cell<D>,
  rowIndex: number,
): React.CSSProperties => {
  const columnProps = getConfigurableColumn(cell.column);
  const anchored = getColumnAnchored(columnProps?.anchored);

  const index = row.indexOf(cell);

  const isFixed = anchored.isFixed;

  let leftColumn: IAnchoredColumnProps = { shift: 0, shadowPosition: 0 };
  let rightColumn: IAnchoredColumnProps = { shift: 0, shadowPosition: 0 };

  if (anchored.isFixed && index > 0) {
    // use first row cell values to calculate the left shift

    if (anchored.direction === 'right') {
      const totalColumns = row.length;

      rightColumn.shadowPosition = totalColumns - calculateTotalColumnsOnFixed(row, 'right');
      rightColumn.shift = calculatePositionShift(row, index, totalColumns - 1).reduce(
        (acc, curr) => (acc as number) + curr,
        0,
      );
    } else if (anchored.direction === 'left') {
      leftColumn.shadowPosition = calculateTotalColumnsOnFixed(row, 'left') - 1;

      leftColumn.shift = calculatePositionShift(row, 0, index).reduce((acc, curr) => (acc as number) + curr, 0);
    }
  }

  let background = rowIndex % 2 === 0 ? '#f0f0f0' : 'white';

  const direction = anchored.direction === 'left' ? 'left' : 'right';

  const shiftedBy = leftColumn.shift || rightColumn.shift;

  const numOfFixed = leftColumn.shadowPosition || rightColumn.shadowPosition;

  const hasShadow = numOfFixed === index && anchored.isFixed;


  const fixedStyled: React.CSSProperties = {
    [direction]: anchored.direction && shiftedBy,
    backgroundColor: isFixed ? background : 'unset',
    boxShadow: hasShadow ? (anchored.direction === 'left' ? '5px 0 3px -2px #ccc' : '-5px 0 3px -2px #ccc') : 'unset',
  };

  return { ...fixedStyled };
};
