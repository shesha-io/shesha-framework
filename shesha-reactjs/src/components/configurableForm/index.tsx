import classNames from 'classnames';
import ConfigurableComponent from '../appConfigurator/configurableComponent';
import EditViewMsg from '../appConfigurator/editViewMsg';
import React, { FC, MutableRefObject, useEffect } from 'react';
import { IConfigurableFormProps, SheshaFormProps } from './models';
import { Form, FormInstance, Spin } from 'antd';
import { useAppConfigurator, useShaRouting, useSheshaApplication } from '@/providers';
import { useFormDesignerUrl } from '@/providers/form/hooks';
import { FormWithFlatMarkup } from './formWithFlatMarkup';
import { useShaForm } from '@/providers/form/store/shaFormInstance';
import { MarkupLoadingError } from './markupLoadingError';
import { LoadingOutlined } from '@ant-design/icons';
import { ConfigurableFormInstance } from '@/interfaces';
import { ShaFormProvider } from '@/providers/form/newProvider/shaFormProvider';
import { IShaFormInstance } from '@/providers/form/store/interfaces';

export type ConfigurableFormProps<Values = any> = Omit<IConfigurableFormProps<Values>, 'form' | 'formRef' | 'shaForm'> & {
  form?: FormInstance<any>;
  formRef?: MutableRefObject<Partial<ConfigurableFormInstance> | null>;
  // TODO: merge with formRef
  shaFormRef?: MutableRefObject<IShaFormInstance>;
  isSettingsForm?: boolean;
} & SheshaFormProps;

export const ConfigurableForm: FC<ConfigurableFormProps> = (props) => {
  const {
    formId,
    markup,
    cacheKey,
    isSettingsForm = false,
    onFinish,
    initialValues,
    onSubmitted,
    onValuesChange,
    formArguments,
    markupLoadingError,
    showFormInfoOverlay = true,
    showDataLoadingIndicator = true,
    showMarkupLoadingIndicator = true,
    shaFormRef,
    mode = 'readonly',
  } = props;
  const { switchApplicationMode, configurationItemMode } = useAppConfigurator();
  const app = useSheshaApplication();

  const [form] = Form.useForm(props.form);
  const [shaForm] = useShaForm({
    form: undefined,
    antdForm: form,
    init: (instance) => {
      instance.setFormMode(props.mode);
    }
  });
  if (shaFormRef)
    shaFormRef.current = shaForm;

  //#region shaForm sync
  useEffect(() => {
    shaForm.setLogEnabled(Boolean(props.logEnabled));
  }, [shaForm, props.logEnabled]);

  useEffect(() => {
    if (formId) {
      shaForm.initByFormId({ formId: formId, configurationItemMode: configurationItemMode, formArguments: formArguments });
    }
  }, [shaForm, formId, configurationItemMode, formArguments]);
  useEffect(() => {
    if (markup) {
      shaForm.initByRawMarkup({
        rawMarkup: markup,
        formArguments: formArguments,
        initialValues: initialValues,
        cacheKey: cacheKey,
        isSettingsForm: isSettingsForm,
      });
    }
  }, [shaForm, markup, formArguments, initialValues, isSettingsForm, cacheKey]);

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

  const canConfigure = Boolean(app.routes.formsDesigner) && Boolean(formId);
  const { router } = useShaRouting(false) ?? {};

  const formDesignerUrl = useFormDesignerUrl(formId);

  const openInDesigner = () => {
    if (formDesignerUrl && router) {
      router.push(formDesignerUrl);
      switchApplicationMode('live');
    }
  };

  const { markupLoadingState, dataLoadingState } = shaForm;

  const MarkupErrorRender = markupLoadingError ?? MarkupLoadingError;

  return (
    <Spin
      spinning={showMarkupLoadingIndicator && markupLoadingState.status === 'loading' || showDataLoadingIndicator && dataLoadingState.status === 'loading'}
      tip={dataLoadingState.hint}
      indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
    >
      <ConfigurableComponent canConfigure={canConfigure} onStartEdit={openInDesigner}>
        {(componentState, BlockOverlay) => (
          <div className={classNames(componentState.wrapperClassName, props?.className)}>
            <BlockOverlay>
              <EditViewMsg persistedFormProps={showFormInfoOverlay ? shaForm.form : undefined} />
            </BlockOverlay>
            <ShaFormProvider shaForm={shaForm}>
              {markupLoadingState.status === 'ready' && (
                <FormWithFlatMarkup
                  {...props}
                  form={form}
                  initialValues={shaForm.initialValues}
                  formFlatMarkup={shaForm.flatStructure}
                  formSettings={shaForm.settings}
                  persistedFormProps={shaForm.form}
                  onMarkupUpdated={() => {
                    shaForm.reloadMarkup();
                  }}
                  shaForm={shaForm}
                />
              )}
              {markupLoadingState.status === 'failed' && (
                <MarkupErrorRender formId={formId} markupLoadingState={markupLoadingState} />
              )}
              {markupLoadingState.status === 'loading' && (
                <></>
              )}
            </ShaFormProvider>
          </div>
        )}
      </ConfigurableComponent>
    </Spin>
  );
};