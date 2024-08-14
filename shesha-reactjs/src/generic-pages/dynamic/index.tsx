import { App } from 'antd';
import classNames from 'classnames';
import React, { Fragment, useMemo, useRef } from 'react';
import { ConfigurableForm } from '@/components';
import { ConfigurableFormInstance, PageWithLayout } from '@/interfaces';
import { IDynamicPageProps } from './interfaces';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { PageMarkupLoadingError } from './pageMarkupLoadError';

const DynamicPageInternal: PageWithLayout<IDynamicPageProps> = (props) => {
  const { message } = App.useApp();
  const formRef = useRef<ConfigurableFormInstance>();
  const { id, formId, mode } = props;

  const formArguments = useMemo(() => {
    console.log('LOG: arguments', id);
    return { id };
  }, [id]);

  const onSubmitted = () => {
    message.success('Data saved successfully!');
    formRef?.current?.setFormMode('readonly');
  };

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

        // TODO: review and restore
        // refetchData={() => refetchFormData()}
        // refetcher={formWithData.refetcher}
        // actions={{ onChangeId, onChangeFormData }}
        />
      </div>
    </Fragment>
  );
};

export const DynamicPage: PageWithLayout<IDynamicPageProps> = (props) => {
  return (
    <DataContextProvider id={'pageContext'} name={'pageContext'} type={'page'}>
      <DynamicPageInternal {...props} />
    </DataContextProvider>
  );
};