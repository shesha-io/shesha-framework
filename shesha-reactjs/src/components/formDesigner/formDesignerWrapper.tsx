import React, { FC, PropsWithChildren } from 'react';
import { ConfigurationItemVersionStatus } from '@/utils/configurationFramework/models';
import {
  Form,
  FormInstance,
  Result,
  Skeleton
} from 'antd';
import { FormDesignerProvider, useFormDesigner } from '@/providers/formDesigner';
import { FormIdentifier } from '@/providers/form/models';
import { FormMarkupConverter } from '@/providers/formMarkupConverter';
import { FormPersisterProvider } from '@/providers/formPersisterProvider';
import { FormPersisterStateConsumer } from '@/providers/formPersisterProvider/contexts';
import { FormProvider } from '@/providers/form';
import { MetadataProvider } from '@/providers';
import { ResultStatusType } from 'antd/lib/result';
import { DataContextProvider } from '@/providers/dataContextProvider';

export interface IFormProviderWrapperProps extends PropsWithChildren {
  formId: FormIdentifier;
}

const FormProviderWrapperInner: FC<PropsWithChildren<{ form: FormInstance }>> = ({ form, children }) => {
  const { allComponents, componentRelations, formSettings } = useFormDesigner();

  return (
    <FormProvider
      needDebug
      name="Designer Form"
      mode="designer"
      allComponents={allComponents}
      componentRelations={componentRelations}
      formSettings={formSettings}
      isActionsOwner={true}
      form={form}
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

          if (formStore.loaded && formStore.markup)
            return (
              <FormMarkupConverter markup={formStore.markup} formSettings={{ ...formStore.formSettings, isSettingsForm: false }}>
                {flatComponents => (
                  /* formContext added to customize the form */
                  <FormDesignerProvider
                    flatComponents={flatComponents}
                    formSettings={formStore.formSettings}
                    readOnly={formStore.formProps?.versionStatus !== ConfigurationItemVersionStatus.Draft}
                  >
                    <DataContextProvider id={'formContext'} name={'formContext'} type={'form'}>
                      <FormProviderWrapperInner form={form}>
                        {children}
                      </FormProviderWrapperInner>
                    </DataContextProvider>
                  </FormDesignerProvider>
                )}
              </FormMarkupConverter>

            );

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