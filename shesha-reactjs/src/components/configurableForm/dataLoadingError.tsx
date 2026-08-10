import React, { FC } from 'react';
import { DataLoadingErrorRenderProps } from './models';
import { Result } from 'antd';
import ValidationErrors from '../validationErrors';
export const DataLoadingError: FC<DataLoadingErrorRenderProps> = ({ dataLoadingState }) => {
  if (!dataLoadingState.error)
    return null;

  const { code } = dataLoadingState.error;

  return code === 404
    ? (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the requested information could not be found"
      />
    )
    : code === 401 || code === 403
      ? (
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to view this content."
        />
      )
      : (
        <ValidationErrors error={dataLoadingState.error} renderMode="alert" defaultMessage="Sorry, an error has occurred. Please try again later" />
      );
};
