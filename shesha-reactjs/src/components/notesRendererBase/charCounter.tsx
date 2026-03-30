import React, { FC } from 'react';
import { useStyles } from './styles/index.style';

export interface ICharCounterProps {
  count: number;
  maxLength?: number;
  error: string | undefined;
}

export const CharCounter: FC<ICharCounterProps> = ({ count, maxLength, error }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.charCounter}>
      {count}
      {maxLength ? `/${maxLength}` : ''}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
