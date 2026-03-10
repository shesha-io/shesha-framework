import { ValidationErrors } from '@/components';
import { MarkupLoadingErrorRenderProps } from '@/components/configurableForm/models';
import { getFormForbiddenMessage } from '@/providers/configurationItemsLoader/utils';
import { App, Button, Result } from 'antd';
import Link from 'next/link';
import React, { FC, useEffect } from 'react';

export const PageMarkupLoadingError: FC<MarkupLoadingErrorRenderProps> = ({ formId, markupLoadingState }) => {
  const { notification } = App.useApp();

  useEffect(() => {
    if (markupLoadingState.status === 'failed' && markupLoadingState.error) {
      notification.error({
        message: 'Sorry! An error occurred.',
        icon: null,
        description: <ValidationErrors error={markupLoadingState.error} renderMode="raw" defaultMessage={null} />,
      });
    }
  }, [notification, markupLoadingState]);

  return (
    <>
      {markupLoadingState.error?.code === 404 && (
        <Result
          status="404"
          style={{ height: '100vh - 55px' }}
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={(
            <Button type="primary">
              <Link href="/">
                Back Home
              </Link>
            </Button>
          )}
        />
      )}
      {(markupLoadingState.error?.code === 401 || markupLoadingState.error?.code === 403) && (
        <Result
          status="403"
          style={{ height: '100vh - 55px' }}
          title="403"
          subTitle={getFormForbiddenMessage(formId)}
          extra={(
            <Button type="primary">
              <Link href="/">
                Back Home
              </Link>
            </Button>
          )}
        />
      )}
    </>
  );
};
