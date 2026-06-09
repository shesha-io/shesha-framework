import classNames from 'classnames';
import ConfigurableComponent from '../appConfigurator/configurableComponent';
import EditViewMsg from '../appConfigurator/editViewMsg';
import React, { MutableRefObject, ReactElement, useEffect, useLayoutEffect, useState } from 'react';
import { IConfigurableFormProps, SheshaFormProps } from './models';
import { Form, FormInstance } from 'antd';
import { useAppConfigurator, useShaRoutingOrUndefined, useSheshaApplication } from '@/providers';
import { useFormDesignerUrl } from '@/providers/form/hooks';
import { FormWithFlatMarkup } from './formWithFlatMarkup';
import { IShaFormDataSource, useShaForm } from '@/providers/form/store/shaFormInstance';
import { MarkupLoadingError } from './markupLoadingError';
import { configurableItemIdentifierToString } from '@/interfaces';
import { ShaFormProvider } from '@/providers/form/providers/shaFormProvider';
import { IShaFormInstance } from '@/providers/form/store/interfaces';
import ParentProvider from '@/providers/parentProvider';
import { ShaSpin } from '..';
import { DataLoadingError } from './dataLoadingError';
import { IFormActionsContext } from '@/providers/form/contexts';

export type ConfigurableFormProps<Values extends object = object> = Omit<IConfigurableFormProps<Values>, 'form' | 'formRef' | 'shaForm'> & {
  form?: FormInstance<Values>;
  formRef?: MutableRefObject<IFormActionsContext> | undefined;
  // TODO: merge with formRef
  shaFormRef?: MutableRefObject<IShaFormInstance<Values>>;
  isSettingsForm?: boolean;
  externalShaForm?: IShaFormInstance<Values> | undefined;
  dataSource?: IShaFormDataSource<Values>;
} & SheshaFormProps;

const ConfigurableFormInner = <Values extends object = object>(props: ConfigurableFormProps<Values>): ReactElement => {
  const {
    formId,
    markup,
    cacheKey,
    isSettingsForm = false,
    onFinish,
    parentFormValues,
    onSubmitted,
    onValuesChange,
    onMarkupLoaded,
    formArguments,
    markupLoadingError,
    showFormInfoOverlay = true,
    showDataLoadingIndicator = true,
    showMarkupLoadingIndicator = true,
    shaFormRef,
    mode = 'readonly',
    actions,
    sections,
    isActionsOwner,
    externalShaForm,
    dataSource,
  } = props;

  // memoize initial values once to avoid unnecessary form initialization
  const [initialValues] = useState(props.initialValues);

  const { switchApplicationMode } = useAppConfigurator();
  const app = useSheshaApplication();

  const [form] = Form.useForm(props.form);
  const [shaForm] = useShaForm({
    // form: undefined,
    form: externalShaForm,
    antdForm: form,
    init: (instance) => {
      instance.setFormMode(props.mode);
      instance.setParentFormValues(parentFormValues);
    },
    dataSource,
  });
  shaForm.setOnMarkupLoaded(onMarkupLoaded);

  useLayoutEffect(() => {
    if (shaFormRef)
      shaFormRef.current = shaForm;
  }, [shaForm, shaFormRef]);

  //#region shaForm sync
  useEffect(() => {
    shaForm.setLogEnabled(Boolean(props.logEnabled));
  }, [shaForm, props.logEnabled]);

  // init form
  useEffect(() => {
    if (formId) {
      void shaForm.initFormByFormId({
        formId: formId,
        formArguments: formArguments,
        initialValues: initialValues,
      });
    }
    if (markup) {
      void shaForm.initFormByRawMarkup({
        rawMarkup: markup,
        formArguments: formArguments,
        initialValues: initialValues,
        cacheKey: cacheKey,
        isSettingsForm: isSettingsForm,
      });
    }
  }, [shaForm, markup, formArguments, initialValues, isSettingsForm, cacheKey, formId]);

  // init form data
  useEffect(() => {
    if (shaForm.markupLoadingState.status === 'ready' && shaForm.dataLoadingState.status === 'waiting') {
      void shaForm.initLoadData();
    }
  }, [shaForm, shaForm.markupLoadingState.status, shaForm.dataLoadingState.status, formId, markup]);

  useEffect(() => {
    shaForm.setFormMode(mode);
  }, [shaForm, mode]);

  useEffect(() => {
    shaForm.setSubmitHandler(onFinish);
  }, [shaForm, onFinish]);

  useEffect(() => {
    shaForm.setOnValuesChange(onValuesChange);
  }, [shaForm, onValuesChange]);


  useEffect(() => {
    shaForm.setAfterSubmitHandler(onSubmitted);
  }, [shaForm, onSubmitted]);
  //#endregion shaForm sync

  const canConfigure = Boolean(app.routes.configurationStudio) && Boolean(formId);
  const { router } = useShaRoutingOrUndefined() ?? {};

  const formDesignerUrl = useFormDesignerUrl(formId);

  const openInDesigner = (): void => {
    if (formDesignerUrl && router) {
      router.push(formDesignerUrl);
      switchApplicationMode('live');
    }
  };

  const { markupLoadingState, dataLoadingState } = shaForm;
  const MarkupErrorRender = markupLoadingError ?? MarkupLoadingError;

  return (
    <ShaSpin
      spinning={(showMarkupLoadingIndicator && markupLoadingState.status === 'loading') || (showDataLoadingIndicator && dataLoadingState.status === 'loading')}
      tip={dataLoadingState.hint}
      spinIconSize={40}
    >
      <ConfigurableComponent canConfigure={canConfigure} onStartEdit={openInDesigner}>
        {(componentState, BlockOverlay) => (
          <div className={classNames(componentState.wrapperClassName, props.className)}>
            <BlockOverlay>
              <EditViewMsg persistedFormProps={showFormInfoOverlay ? shaForm.form : undefined} />
            </BlockOverlay>
            <ShaFormProvider shaForm={shaForm}>
              <ParentProvider
                model={null}
                formMode={shaForm.formMode}
                formFlatMarkup={shaForm.flatStructure}
                formApi={shaForm.getPublicFormApi()}
              >
                {markupLoadingState.status === 'ready' && (
                  <>
                    {dataLoadingState.status === 'failed'
                      ? (
                        <DataLoadingError formId={formId} dataLoadingState={dataLoadingState} />
                      )
                      : (
                        <FormWithFlatMarkup<Values>
                          {...props}
                          mode={dataLoadingState.status !== 'ready' ? 'readonly' : props.mode}
                          isActionsOwner={isActionsOwner}
                          form={form}
                          initialValues={shaForm.initialValues}
                          formFlatMarkup={shaForm.flatStructure}
                          formSettings={shaForm.settings}
                          persistedFormProps={shaForm.form}
                          onMarkupUpdated={() => {
                            shaForm.reloadMarkup().catch((error) => {
                              console.error('Failed to reload markup', error);
                              throw error;
                            });
                          }}
                          shaForm={shaForm}
                          actions={actions}
                          sections={sections}
                        />
                      )}

                  </>
                )}
                {markupLoadingState.status === 'failed' && (
                  <MarkupErrorRender formId={formId} markupLoadingState={markupLoadingState} />
                )}
                {markupLoadingState.status === 'loading' && (
                  <></>
                )}
              </ParentProvider>
            </ShaFormProvider>
          </div>
        )}
      </ConfigurableComponent>
    </ShaSpin>
  );
};

export const ConfigurableForm = <Values extends object = object>(props: ConfigurableFormProps<Values>): ReactElement => {
  return (
    <ParentProvider
      model={null}
      name={props.formId ? configurableItemIdentifierToString(props.formId) : `form`}
      isScope
    >
      <ConfigurableFormInner {...props} />
    </ParentProvider>
  );
};
