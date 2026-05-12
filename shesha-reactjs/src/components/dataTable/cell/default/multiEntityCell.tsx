import React, { ReactNode } from 'react';
import { IDataCellProps } from '../interfaces';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useStyles } from '../../styles/styles';
import { getDisplayNameOrUndefined } from '@/utils/object';

export type IMultiEntityCellProps<D extends object = object, V = unknown> = IDataCellProps<D, V>;

export const MultiEntityCell = <D extends object = object, V = unknown>(props: IMultiEntityCellProps<D, V>): ReactNode => {
  const { styles } = useStyles();
  const { value } = props;
  if (!props.value) return null;

  const values = Array.isArray(value)
    ? value.map((item) => ({ label: getDisplayNameOrUndefined(item) }))
    : [{ label: getDisplayNameOrUndefined(value) }];
  return <span className={styles.shaMultiEntityCell}><ReadOnlyDisplayFormItem value={values} type="dropdownMultiple" /></span>;
};

export default MultiEntityCell;
