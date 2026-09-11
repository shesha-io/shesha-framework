import { FC } from 'react';
import { QueryChangeResult } from '@/components/queryBuilder/interfaces';
import { QueryBuilder } from '@/components/queryBuilder';
import { useStyles } from './styles/styles';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';

export interface IQueryBuilderPlainProps {
  value?: JsonLogicFilter | undefined;
  onChange?: ((value: JsonLogicFilter | null) => void) | undefined;
  readOnly?: boolean | undefined;
}

export const QueryBuilderPlain: FC<IQueryBuilderPlainProps> = ({ value, onChange, readOnly = false }) => {
  const { styles } = useStyles();
  const handleChange = (jsonLogicResult: QueryChangeResult): void => {
    if (readOnly) return;
    if (jsonLogicResult.errors.length > 0) return;
    if (onChange) onChange(jsonLogicResult.logic ?? null);
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
