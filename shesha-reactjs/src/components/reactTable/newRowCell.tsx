import CrudOperationsCell from '@/components/dataTable/cell/crudOperationsCell';
import { CreateDataCell } from '@/components/dataTable/cell/dataCell';
import { DataTableColumn } from '@/components/dataTable/interfaces';
import { FormIdentifier, useMetadata } from '@/providers';
import React, { FC } from 'react';
import { Cell, ColumnInstance, HeaderPropGetter } from 'react-table';
import { toCamelCase } from '@/utils/string';
import { asPropertiesArray } from '@/interfaces/metadata';
import { calculatePositionShift, calculateTotalColumnsOnFixed, getColumnAnchored } from '@/utils/datatable';
import { IAnchoredColumnProps } from '@/providers/dataTable/interfaces';
import classNames from 'classnames';
import { useStyles } from './styles/styles';
import { CreateFormCell, ICreateFormCellProps } from '../dataTable/cell/formCell/formCell';
import { isFormFullName } from '@/index';

const cellProps: HeaderPropGetter<object> = (props) => [
  props,
  {
    style: {
      display: 'flex',
      height: '-webkit-fill-available !important',
    },
  },
];

export interface INewRowCellProps {
  column: ColumnInstance;
  row?: ColumnInstance[];
  rowIndex?: number;
  parentFormId?: FormIdentifier;
}

export const NewRowCell: FC<INewRowCellProps> = ({ column, row, parentFormId }) => {
  const columnConfig = (column as DataTableColumn)?.originalConfig;

  const metadata = useMetadata(false)?.metadata;
  const propertyMeta = asPropertiesArray(metadata?.properties, []).find(({ path }) => toCamelCase(path) === column.id);
  const { styles } = useStyles();
  const { key, ...headerProps } = column.getHeaderProps(cellProps);
  const anchored = getColumnAnchored((column as any)?.anchored);
  const index = row.indexOf(column);
  const isFixed = anchored?.isFixed;

  let leftColumn: IAnchoredColumnProps = { shift: 0, shadowPosition: 0 };
  let rightColumn: IAnchoredColumnProps = { shift: 0, shadowPosition: 0 };

  const rowColumns = row?.map((col) => ({ column: col })) as Cell<any, any, any>[];

  if (anchored?.isFixed && index > 0) {
    // use first row cell values to calculate the left shift

    if (anchored?.direction === 'right') {
      const totalColumns = row?.length;
      rightColumn.shadowPosition = totalColumns - calculateTotalColumnsOnFixed(rowColumns, 'right');

      rightColumn.shift = calculatePositionShift(rowColumns, index, totalColumns - 1)?.reduce(
        (acc, curr) => (acc as number) + curr,
        0,
      );
    } else if (anchored?.direction === 'left') {
      leftColumn.shadowPosition = calculateTotalColumnsOnFixed(rowColumns, 'left') - 1;

      leftColumn.shift = calculatePositionShift(rowColumns, 0, index)?.reduce((acc, curr) => (acc as number) + curr, 0);
    }
  }

  const direction = anchored?.direction === 'left' ? 'left' : 'right';

  const shiftedBy = leftColumn.shift || rightColumn.shift;

  delete headerProps.style.position;

  const fixedStyled: React.CSSProperties = {
    [direction]: anchored?.direction && shiftedBy,
    height: '100%',
  };

  const numOfFixed = leftColumn.shadowPosition || rightColumn.shadowPosition;

  const hasShadow = numOfFixed === index && anchored?.isFixed;

  const parentFormProps: ICreateFormCellProps = {};
  if (isFormFullName(parentFormId))
    parentFormProps.parentFormName = `${parentFormId.module}/${parentFormId.name}`;
  else if (typeof parentFormId === 'string' && parentFormId)
    parentFormProps.parentFormId = parentFormId;

  return (
    <div
      {...headerProps}
      style={{ ...headerProps?.style, ...fixedStyled }}
      className={classNames(styles.td, {
        [styles.fixedColumn]: isFixed,
        [styles.relativeColumn]: !isFixed,
        [anchored?.direction === 'right' ? styles.boxShadowRight : styles.boxShadowLeft]: hasShadow,
      }, styles.shaCrudCell)}
    >
      {columnConfig && columnConfig.columnType === 'data' && (
        <div className={styles.shaCellParentFW}>
          <CreateDataCell columnConfig={columnConfig} propertyMeta={propertyMeta} />
        </div>
      )}
      {columnConfig && columnConfig.columnType === 'form' && (
        <CreateFormCell columnConfig={columnConfig} {...parentFormProps} />
      )}
      {columnConfig && columnConfig.columnType === 'crud-operations' && (
        <CrudOperationsCell />
      )}
    </div>
  );
};
