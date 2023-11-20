import { Result, Skeleton } from 'antd';
import { ResultStatusType } from 'antd/lib/result';
import React, { FC, PropsWithChildren } from 'react';
import { FormIdentifier } from '../../../providers/form/models';
import { FormDesignerProvider } from '../../../providers/formDesigner';
import { FormMarkupConverter } from '../../../providers/formMarkupConverter';
import { FormPersisterProvider } from '../../../providers/formPersisterProvider';
import { FormPersisterStateConsumer } from '../../../providers/formPersisterProvider/contexts';
import { ConfigurationItemVersionStatus } from '../../../utils/configurationFramework/models';

export interface IFormDesignerProps {
  formId: FormIdentifier;
}

export const FormInfoContentConainter: FC<PropsWithChildren<IFormDesignerProps>> = ({ children, formId }) => (
  <FormPersisterProvider formId={formId} skipCache={true}>
    <FormPersisterStateConsumer>
      {(formStore) => {
        const { formSettings, formProps, loaded, loadError, loading, markup } = formStore;

        if (loading) return <Skeleton loading active />;

        if (loaded && markup)
          return (
            <FormMarkupConverter markup={markup} formSettings={{ ...formSettings, isSettingsForm: false }}>
              {(flatComponents) => (
                <FormDesignerProvider
                  flatComponents={flatComponents}
                  formSettings={formSettings}
                  readOnly={formProps?.versionStatus !== ConfigurationItemVersionStatus.Draft}
                >
                  {children}
                </FormDesignerProvider>
              )}
            </FormMarkupConverter>
          );

        if (loadError)
          return (
            <Result status={loadError.code as ResultStatusType} title={loadError.code} subTitle={loadError.message} />
          );

        return null;
      }}
    </FormPersisterStateConsumer>
  </FormPersisterProvider>
);

export default FormInfoContentConainter;
