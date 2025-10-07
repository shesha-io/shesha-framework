import React, { FC } from 'react';
import { JsonLogicResult } from '@react-awesome-query-builder/antd';
import { QueryBuilder } from '@/components';
import { useStyles } from './styles/styles';

export interface IQueryBuilderPlainProps {
  value?: object;
  onChange?: (value: Object) => void;
  readOnly?: boolean;
}

export const QueryBuilderPlain: FC<IQueryBuilderPlainProps> = ({ value, onChange, readOnly = false }) => {
  const { styles } = useStyles();
  const handleChange = (jsonLogicResult: JsonLogicResult): void => {
    if (readOnly) return;
    if (jsonLogicResult) {
      if (jsonLogicResult && jsonLogicResult.errors && jsonLogicResult.errors.length > 0) {
        // show errors
        return;
      }

      if (onChange) {
        onChange(jsonLogicResult?.logic);
      }
    }
  };

  return (
    <div className={styles.shaQueryBuilderPlainWrapper}>
      <QueryBuilder
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
      />
    </div>
  );
};

export default QueryBuilderPlain;
