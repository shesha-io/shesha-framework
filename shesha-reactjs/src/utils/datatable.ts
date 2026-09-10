import { Cell, ColumnInstance } from 'react-table';
import { IAnchoredDirection } from '@/providers/dataTable/interfaces';
import { isDefined } from './nullables';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';

export interface IAnchoredColumn {
  isFixed: boolean;
  direction?: IAnchoredDirection;
}

// TODO V1: review after refactoring
export const getConfigurableColumn = <D extends object = object>(column: ColumnInstance<D>): IConfigurableColumnsProps | undefined => {
  return column as unknown as IConfigurableColumnsProps;
};

export const getColumnAnchored = (anchored: string | undefined): IAnchoredColumn => {
  if (anchored === 'left') {
    return {
      isFixed: true,
      direction: 'left',
    };
  } else if (anchored === 'right') {
    return {
      isFixed: true,
      direction: 'right',
    };
  } else {
    return {
      isFixed: false,
    };
  }
};

export const calculateTotalColumnsOnFixed = <D extends object = object>(row: Pick<Cell<D>, 'column'>[], direction: IAnchoredDirection): number => {
  return row.filter(({ column }) => getColumnAnchored(column.anchored).direction === direction).length;
};

export const calculatePositionShift = <D extends object = object>(row: Pick<Cell<D>, 'column'>[], start: number, end: number): Array<number> => {
  return row.slice(start, end).map((col) => {
    // TODO: check type of `col.column.width` and remove string or handle it here
    return isDefined(col.column.minWidth) && isDefined(col.column.width) && typeof (col.column.width) === 'number' && col.column.width < col.column.minWidth
      ? col.column.minWidth
      : col.column.width;
  }) as Array<number>;
};

// Filter evaluation moved to `@/utils/filterEvaluation`; these names are kept for existing callers.
export { evaluateDynamicFilters, evaluateDynamicFiltersSync } from './filterEvaluation/adapters';
