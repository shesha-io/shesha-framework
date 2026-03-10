import React from 'react';
import { IDataCellProps } from '../interfaces';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useStyles } from '../../styles/styles';

export type IMultiEntityCellProps<D extends object = object, V = any> = IDataCellProps<D, V>;

export const MultiEntityCell = <D extends object = object, V = any>(props: IMultiEntityCellProps<D, V>): JSX.Element => {
  const { styles } = useStyles();
  const { value } = props;
  if (!props.value) return null;

  const values = Array.isArray(value) ? value.map((item) => ({ label: item['_displayName'] })) : [{ label: value['_displayName'] }];
  return <span className={styles.shaMultiEntityCell}><ReadOnlyDisplayFormItem value={values} type="dropdownMultiple" /></span>;
};

export default MultiEntityCell;
