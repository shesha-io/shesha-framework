import React, { FC } from 'react';
import { Result, Skeleton } from 'antd';
import { FormProvider } from '../../providers/form';
import { FormIdentifier } from '../../providers/form/models';
import { FormPersisterProvider } from '../../providers/formPersisterProvider';
import { FormPersisterStateConsumer } from '../../providers/formPersisterProvider/contexts';
import { FormDesignerProvider } from '../../providers/formDesigner';
import { FormDesignerStateConsumer } from '../../providers/formDesigner/contexts';
import { FormMarkupConverter } from '../../providers/formMarkupConverter';
import { FormDesignerRenderer } from './formDesignerRenderer';
import { ConfigurationItemVersionStatus } from '../../utils/configurationFramework/models';
import { ResultStatusType } from 'antd/lib/result';

export interface IFormDesignerProps {
  formId: FormIdentifier;
}

export const FormDesigner: FC<IFormDesignerProps> = ({ formId }) => {
  return (
    <FormPersisterProvider formId={formId} skipCache={true}>
      <FormPersisterStateConsumer>
        {formStore => {
          if (formStore.loading)
            return (<Skeleton loading active />);

          if (formStore.loaded && formStore.markup)
            return (
              <FormMarkupConverter markup={formStore.markup}>
                {flatComponents => (
                  <FormDesignerProvider
                    flatComponents={flatComponents}
                    formSettings={formStore.formSettings}
                    readOnly={formStore.formProps?.versionStatus !== ConfigurationItemVersionStatus.Draft}
                  >
                    <FormDesignerStateConsumer>
                      {designerState => (
                        <FormProvider
                          name="Form"
                          mode="designer"
                          flatComponents={{ allComponents: designerState.allComponents, componentRelations: designerState.componentRelations }}
                          formSettings={designerState.formSettings}
                          isActionsOwner={true}
                        >
                          <FormDesignerRenderer />
                        </FormProvider>
                      )}
                    </FormDesignerStateConsumer>
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
}

export default FormDesigner;
