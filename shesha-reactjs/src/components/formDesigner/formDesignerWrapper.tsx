import React, { FC, PropsWithChildren } from 'react';
import { ConfigurationItemVersionStatus } from '@/utils/configurationFramework/models';
import {
  Form,
  FormInstance,
  Result,
  Skeleton
} from 'antd';
import { FormDesignerProvider, useFormDesignerStateSelector } from '@/providers/formDesigner';
import { FormIdentifier } from '@/providers/form/models';
import { FormPersisterProvider } from '@/providers/formPersisterProvider';
import { FormPersisterStateConsumer } from '@/providers/formPersisterProvider/contexts';
import { FormProvider, ShaForm } from '@/providers/form';
import { MetadataProvider } from '@/providers';
import { ResultStatusType } from 'antd/lib/result';
import { useShaForm } from '@/providers/form/store/shaFormInstance';
import { ShaFormProvider } from '@/providers/form/providers/shaFormProvider';

export interface IFormProviderWrapperProps extends PropsWithChildren {
  formId: FormIdentifier;
}

const FormProviderWrapperInner: FC<PropsWithChildren<{ form: FormInstance }>> = ({ form, children }) => {
  const formSettings = useFormDesignerStateSelector(x => x.formSettings);
  const formFlatMarkup = useFormDesignerStateSelector(x => x.formFlatMarkup);

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
    }
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

export const FormProviderWrapper: FC<IFormProviderWrapperProps> = ({ formId, children }) => {
  const [form] = Form.useForm();

  return (
    <FormPersisterProvider formId={formId} skipCache={true}>
      <FormPersisterStateConsumer>
        {formStore => {
          if (formStore.loading)
            return (<Skeleton loading active />);

          if (formStore.loaded) {
            const { flatStructure, settings } = formStore.formProps;
            return (
              <FormDesignerProvider
                flatMarkup={flatStructure}
                formSettings={settings}
                readOnly={formStore.formProps?.versionStatus !== ConfigurationItemVersionStatus.Draft}
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
              />);

          return null;
        }}
      </FormPersisterStateConsumer>
    </FormPersisterProvider>
  );
};