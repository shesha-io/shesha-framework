import React, { FC } from 'react';
import { Form, FormInstance, Result, Skeleton } from 'antd';
import { FormProvider } from '../../providers/form';
import { FormIdentifier } from '../../providers/form/models';
import { FormPersisterProvider } from '../../providers/formPersisterProvider';
import { FormPersisterStateConsumer } from '../../providers/formPersisterProvider/contexts';
import { FormDesignerProvider, useFormDesigner } from '../../providers/formDesigner';
import { FormMarkupConverter } from '../../providers/formMarkupConverter';
import { FormDesignerRenderer } from './formDesignerRenderer';
import { ConfigurationItemVersionStatus } from '../../utils/configurationFramework/models';
import { ResultStatusType } from 'antd/lib/result';

export interface IFormDesignerProps {
  formId: FormIdentifier;
}

export const FormDesigner: FC<IFormDesignerProps> = ({ formId }) => {
  const [form] = Form.useForm();

  return (
    <FormPersisterProvider formId={formId} skipCache={true}>
      <FormPersisterStateConsumer>
        {formStore => {
          if (formStore.loading)
            return (<Skeleton loading active />);

          if (formStore.loaded && formStore.markup)
            return (
              <FormMarkupConverter markup={formStore.markup} formSettings={formStore.formSettings}>
                {flatComponents => (
                  <FormDesignerProvider
                    flatComponents={flatComponents}
                    formSettings={formStore.formSettings}
                    readOnly={formStore.formProps?.versionStatus !== ConfigurationItemVersionStatus.Draft}
                  >
                    <FormProviderWrapper form={form}/>
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

const FormProviderWrapper: FC<{ form: FormInstance }> = ({ form }) => {
  const { allComponents, componentRelations, formSettings } = useFormDesigner();

  return (
    <FormProvider
      name="Designer Form"
      mode="designer"
      allComponents={allComponents}
      componentRelations={componentRelations}
      formSettings={formSettings}
      isActionsOwner={true}
      form={form}
    >
      <FormDesignerRenderer />
    </FormProvider>
  );
};

export default FormDesigner;
