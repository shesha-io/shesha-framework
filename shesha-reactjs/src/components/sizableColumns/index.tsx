import React, { FC } from 'react';
import Split, { SplitProps } from 'react-split';
import { useStyles } from './styles';
import classNames from 'classnames';

/**
 * Sizable columns component.
 */
export const SizableColumns: FC<SplitProps> = (props) => {
  const { styles } = useStyles();
  return (<Split {...props} className={classNames(props.className, styles.split)} />);
};
