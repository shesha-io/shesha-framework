import { MetadataProvider } from '@/providers';
import { FormProvider, ShaForm } from '@/providers/form';
import { FormIdentifier } from '@/providers/form/models';
import { ShaFormProvider } from '@/providers/form/providers/shaFormProvider';
import { useShaForm } from '@/providers/form/store/shaFormInstance';
import { FormDesignerProvider, useFormDesignerMarkup, useFormDesignerSettings } from '@/providers/formDesigner';
import { FormPersisterProvider, useFormPersisterState } from '@/providers/formPersisterProvider';
import {
  Form,
  FormInstance,
  Result,
  Skeleton,
} from 'antd';
import { ResultStatusType } from 'antd/lib/result';
import React, { FC, PropsWithChildren } from 'react';

export interface IFormProviderWrapperProps {
  formId: FormIdentifier;
}

const FormProviderWrapperInner: FC<PropsWithChildren<{ form: FormInstance }>> = ({ form, children }) => {
  const formSettings = useFormDesignerSettings();
  const formFlatMarkup = useFormDesignerMarkup();

  const [shaForm] = useShaForm({
    form: undefined,
    antdForm: form,
    init: (shaForm) => {
      shaForm.setFormMode("designer");
      shaForm.initByMarkup({
        formSettings,
        formFlatMarkup,
        formArguments: undefined,
      });
    },
  });

  return (
    <ShaFormProvider shaForm={shaForm}>
      <ShaForm.MarkupProvider markup={formFlatMarkup}>
        <FormProvider
          name="Form"
          mode="designer"
          formSettings={formSettings}
          isActionsOwner={true}
          form={form}
          shaForm={shaForm}
        >
          <>
            {formSettings.modelType ? (
              <MetadataProvider id="designer" modelType={formSettings.modelType}>
                {children}
              </MetadataProvider>
            ) : (
              <>{children}</>
            )}
          </>
        </FormProvider>
      </ShaForm.MarkupProvider>
    </ShaFormProvider>
  );
};

const FormPersisterStateConsumer: FC<PropsWithChildren> = ({ children }) => {
  const [form] = Form.useForm();
  const formStore = useFormPersisterState();

  if (formStore.loading)
    return (<Skeleton loading active />);

  if (formStore.loaded) {
    const { flatStructure, settings, readOnly } = formStore.formProps;
    return (
      <FormDesignerProvider
        flatMarkup={flatStructure}
        formSettings={settings}
        readOnly={readOnly}
      >
        <FormProviderWrapperInner form={form}>
          {children}
        </FormProviderWrapperInner>
      </FormDesignerProvider>
    );
  }

  if (formStore.loadError)
    return (
      <Result
        status={formStore.loadError.code as ResultStatusType}
        title={formStore.loadError.code}
        subTitle={formStore.loadError.message}
      />
    );

  return null;
};

export const FormProviderWrapper: FC<PropsWithChildren<IFormProviderWrapperProps>> = ({ children, ...props }) => {
  const { formId } = props;

  return (
    <FormPersisterProvider formId={formId}>
      <FormPersisterStateConsumer>
        {children}
      </FormPersisterStateConsumer>
    </FormPersisterProvider>
  );
};
