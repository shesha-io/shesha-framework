import { App } from 'antd';
import classNames from 'classnames';
import React, { Fragment, useCallback, useMemo, useRef } from 'react';
import { ConfigurableForm } from '@/components';
import { ConfigurableFormInstance, PageWithLayout } from '@/interfaces';
import { IDynamicPageProps } from './interfaces';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { PageMarkupLoadingError } from './pageMarkupLoadError';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';

const DynamicPageInternal: PageWithLayout<IDynamicPageProps> = (props) => {
  const { message } = App.useApp();
  const formRef = useRef<ConfigurableFormInstance>();
  const { id, formId, mode } = props;

  const formArguments = useMemo(() => {
    return { id };
  }, [id]);

  const onSubmitted = useCallback(() => {
    message.success('Data saved successfully!');
    formRef?.current?.setFormMode('readonly');
  }, [message, formRef.current]);

  return (
    <Fragment>
      <div id="modalContainerId" className={classNames('sha-dynamic-page')}>
        <ConfigurableForm
          formName='dynamic-page-form'
          mode={mode}

          className="sha-dynamic-page"
          isActionsOwner={true}

          formId={formId}
          formArguments={formArguments}
          onSubmitted={onSubmitted}

          formRef={formRef}
          markupLoadingError={PageMarkupLoadingError}
        />
      </div>
    </Fragment>
  );
};

export const DynamicPage: PageWithLayout<IDynamicPageProps> = (props) => {
  return (
    <DataContextProvider id={SheshaCommonContexts.PageContext} name={SheshaCommonContexts.PageContext} type={'page'}>
      <DynamicPageInternal {...props} />
    </DataContextProvider>
  );
};