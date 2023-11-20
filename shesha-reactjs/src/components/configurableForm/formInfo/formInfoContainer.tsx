import { Result, Skeleton } from 'antd';
import { ResultStatusType } from 'antd/lib/result';
import React, { FC, PropsWithChildren, ReactNode } from 'react';
import { FormIdentifier } from '../../../providers/form/models';
import { FormDesignerProvider, IFormDesignerFinishEvents } from '../../../providers/formDesigner';
import { FormMarkupConverter } from '../../../providers/formMarkupConverter';
import { FormPersisterProvider } from '../../../providers/formPersisterProvider';
import { FormPersisterStateConsumer } from '../../../providers/formPersisterProvider/contexts';
import { ConfigurationItemVersionStatus } from '../../../utils/configurationFramework/models';

export interface IFormDesignerProps extends IFormDesignerFinishEvents {
  formId: FormIdentifier;
  toolbarRightButton: ReactNode;
}

export const FormInfoContentConainter: FC<PropsWithChildren<IFormDesignerProps>> = ({ children, formId, ...rest }) => (
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
                  {...rest}
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
