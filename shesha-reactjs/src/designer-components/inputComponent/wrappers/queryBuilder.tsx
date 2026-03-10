import { IQueryBuilderSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { QueryBuilder } from '../../queryBuilder/queryBuilder';

export const QueryBuilderWrapper: FC<IQueryBuilderSettingsInputProps> = (props) => {
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
