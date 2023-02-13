import React, { FC } from 'react';
import { JsonLogicResult } from 'react-awesome-query-builder';
import { IProperty } from '../../../../providers/queryBuilder/models';
import QueryBuilder from '../../../queryBuilder';
import './styles/queryBuilderPlain.less';

export interface IQueryBuilderPlainProps {
  useExpression?: boolean;
  fields: IProperty[];
  fetchFields: (fieldNames: string[]) => void;
  value?: object;
  onChange?: (value: Object) => void;
  readOnly?: boolean;
}

export const QueryBuilderPlain: FC<IQueryBuilderPlainProps> = ({ value, fields, fetchFields, useExpression, onChange, readOnly = false }) => {
  const handleChange = (jsonLogicResult: JsonLogicResult) => {
    if (readOnly)
      return;
    if (jsonLogicResult) {
      if (jsonLogicResult && jsonLogicResult.errors && jsonLogicResult.errors.length > 0) {
        console.log(jsonLogicResult);
        // show errors
        return;
      }

      if (onChange) {
        onChange(jsonLogicResult?.logic);
      }
    }
  };

  return (
    <div className="sha-query-builder-plain-wrapper">
      <QueryBuilder 
        value={value} 
        onChange={handleChange} 
        fields={fields}
        fetchFields={fetchFields}
        useExpression={useExpression} 
        readOnly={readOnly}
      />
    </div>
  );
};

export default QueryBuilderPlain;
