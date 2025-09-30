import React from 'react';
import { IDataCellProps } from '../interfaces';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useStyles } from '../../styles/styles';

export interface IMultiEntityCellProps<D extends object = {}, V = any> extends IDataCellProps<D, V> {}

export const MultiEntityCell = <D extends object = {}, V = any>(props: IMultiEntityCellProps<D, V>) => {
  const { styles } = useStyles();
  const { value } = props;
  if (!props.value) return null;

  const values = Array.isArray(value) ? value.map((item) => ({ label: item['_displayName'] })) : [{ label: value['_displayName'] }];
  return <span className={styles.shaMultiEntityCell}><ReadOnlyDisplayFormItem value={values} type="dropdownMultiple" /></span>;
};

export default MultiEntityCell;
