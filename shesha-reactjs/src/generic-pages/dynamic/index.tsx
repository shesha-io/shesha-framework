import { App } from 'antd';
import classNames from 'classnames';
import React, { FC, Fragment, useCallback, useMemo } from 'react';
import { ConfigurableForm } from '@/components/configurableForm';
import { IDynamicPageProps } from './interfaces';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { PageMarkupLoadingError } from './pageMarkupLoadError';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';

const DynamicPageInternal: FC<IDynamicPageProps> = (props) => {
  const { message } = App.useApp();
  const shaFormRef = useShaFormRef();
  const { id, formId, mode = 'readonly' } = props;

  const formArguments = useMemo(() => {
    return { id };
  }, [id]);

  const onSubmitted = useCallback(() => {
    message.success('Data saved successfully!');
    shaFormRef.current?.setFormMode('readonly');
  }, [message, shaFormRef]);

  return (
    <Fragment>
      <div id="modalContainerId" className={classNames('sha-dynamic-page')}>
        <ConfigurableForm
          formName="dynamic-page-form"
          mode={mode}

          className="sha-dynamic-page"
          isActionsOwner={true}

          formId={formId}
          formArguments={formArguments}
          onSubmitted={onSubmitted}

          shaFormRef={shaFormRef}
          markupLoadingError={PageMarkupLoadingError}
        />
      </div>
    </Fragment>
  );
};

export const DynamicPage: FC<IDynamicPageProps> = (props) => {
  return (
    <DataContextProvider
      id={SheshaCommonContexts.PageContext}
      name={SheshaCommonContexts.PageContext}
      type="page"
      webStorageType="sessionStorage"
    >
      <DynamicPageInternal {...props} />
    </DataContextProvider>
  );
};
