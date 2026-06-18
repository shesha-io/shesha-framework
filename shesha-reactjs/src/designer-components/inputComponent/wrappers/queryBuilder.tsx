import { IQueryBuilderSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { QueryBuilder } from '../../queryBuilder/queryBuilder';

export const QueryBuilderWrapper: FCUnwrapped<IQueryBuilderSettingsInputProps> = (props) => {
  const { readOnly } = props;
  return (
    <QueryBuilder
      {...props}
      // TODO: review id and hidden props, they are not used in QueryBuilder
      id={props.id ?? 'queryBuilder'}
      hidden={false}
      hideLabel={true}
      readOnly={readOnly}
    />
  );
};
