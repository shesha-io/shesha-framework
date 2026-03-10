import React, { FC } from 'react';
import { MarkupLoadingErrorRenderProps } from './models';
import { Result } from 'antd';
import { getFormForbiddenMessage, getFormNotFoundMessage } from '@/providers/configurationItemsLoader/utils';

export const MarkupLoadingError: FC<MarkupLoadingErrorRenderProps> = ({ formId, markupLoadingState }) => {
  return (
    <>
      {markupLoadingState.error?.code === 404 && (
        <Result
          status="404"
          title="404"
          subTitle={getFormNotFoundMessage(formId)}
        />
      )}
      {(markupLoadingState.error?.code === 401 || markupLoadingState.error?.code === 403) && (
        <Result
          status="403"
          title="403"
          subTitle={getFormForbiddenMessage(formId)}
        />
      )}
    </>
  );
};
