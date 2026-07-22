import React, { FC } from 'react';
import { JsonLogicResult } from '@react-awesome-query-builder/antd';
import { QueryBuilder } from '@/components/queryBuilder';
import { useStyles } from './styles/styles';
import { isDefined } from '@/utils/nullables';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';

export interface IQueryBuilderPlainProps {
  value?: object | undefined;
  onChange?: ((value: JsonLogicFilter | null) => void) | undefined;
  readOnly?: boolean | undefined;
}

export const QueryBuilderPlain: FC<IQueryBuilderPlainProps> = ({ value, onChange, readOnly = false }) => {
  const { styles } = useStyles();
  const handleChange = (jsonLogicResult: JsonLogicResult): void => {
    if (readOnly) return;
    if (isDefined(jsonLogicResult)) {
      if (jsonLogicResult.errors && jsonLogicResult.errors.length > 0) {
        // show errors
        return;
      }

      if (onChange) {
        onChange(jsonLogicResult.logic ?? null);
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
