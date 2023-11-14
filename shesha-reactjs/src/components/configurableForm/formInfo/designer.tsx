import { Result, Skeleton } from 'antd';
import { ResultStatusType } from 'antd/lib/result';
import React, { FC } from 'react';
import { FormIdentifier } from '../../../providers/form/models';
import { FormDesignerProvider } from '../../../providers/formDesigner';
import { FormMarkupConverter } from '../../../providers/formMarkupConverter';
import { FormPersisterProvider } from '../../../providers/formPersisterProvider';
import { FormPersisterStateConsumer } from '../../../providers/formPersisterProvider/contexts';
import { ConfigurationItemVersionStatus } from '../../../utils/configurationFramework/models';
import { FormDesignerRenderer } from '../../formDesigner/formDesignerRenderer';

export interface IFormDesignerProps {
  formId: FormIdentifier;
}

export const FormDesigner: FC<IFormDesignerProps> = ({ formId }) => {
  return (
    <FormPersisterProvider formId={formId} skipCache={true}>
      <FormPersisterStateConsumer>
        {(formStore) => {
          if (formStore.loading) return <Skeleton loading active />;

          if (formStore.loaded && formStore.markup)
            return (
              <FormMarkupConverter
                markup={formStore.markup}
                formSettings={{ ...formStore.formSettings, isSettingsForm: false }}
              >
                {(flatComponents) => (
                  <FormDesignerProvider
                    flatComponents={flatComponents}
                    formSettings={formStore.formSettings}
                    readOnly={formStore.formProps?.versionStatus !== ConfigurationItemVersionStatus.Draft}
                  >
                    <FormDesignerRenderer />
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
              />
            );

          return null;
        }}
      </FormPersisterStateConsumer>
    </FormPersisterProvider>
  );
};

export default FormDesigner;
