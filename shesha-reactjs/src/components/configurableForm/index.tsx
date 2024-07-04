import classNames from 'classnames';
import ConfigurableComponent from '../appConfigurator/configurableComponent';
import EditViewMsg from '../appConfigurator/editViewMsg';
import React, { FC } from 'react';
import { FormPersisterActionsContext } from '@/providers/formPersisterProvider/contexts';
import { FormPersisterConsumer, FormPersisterProvider } from '@/providers/formPersisterProvider';
import { getFormNotFoundMessage } from '@/providers/configurationItemsLoader/utils';
import { IConfigurableFormProps } from './models';
import { Result } from 'antd';
import { MetadataProvider, useAppConfigurator, useShaRouting, useSheshaApplication } from '@/providers';
import { useFormDesignerUrl } from '@/providers/form/hooks';
import { FormWithFlatMarkup } from './formWithFlatMarkup';
import { FormWithRawMarkup } from './formWithRawMarkup';

export const ConfigurableForm: FC<IConfigurableFormProps> = (props) => {
  const {
    formId,
    formProps,
    markup,
    cacheKey,
  } = props;
  const { switchApplicationMode } = useAppConfigurator();
  const app = useSheshaApplication();
  const canConfigure = Boolean(app.routes.formsDesigner) && Boolean(formId);
  const { router } = useShaRouting(false) ?? {};

  const formDesignerUrl = useFormDesignerUrl(formId);

  const openInDesigner = () => {
    if (formDesignerUrl && router) {
      router.push(formDesignerUrl);
      switchApplicationMode('live');
    }
  };

    return (
    <ConfigurableComponent canConfigure={canConfigure} onStartEdit={openInDesigner}>
      {(componentState, BlockOverlay) => (
        <div className={classNames(componentState.wrapperClassName, props?.className)}>
          <BlockOverlay>
            <EditViewMsg persistedFormProps={formProps} />
          </BlockOverlay>
          {markup ? (
            <FormWithRawMarkup
              {...props}
              markup={markup}
              cacheKey={cacheKey}
            />
          ) : (
            <FormPersisterProvider formId={formId}>
              <FormPersisterActionsContext.Consumer>
                {(persisterActions) => (
                  <FormPersisterConsumer>
                    {(persister) => (
                      <>
                        {persister.loadError?.code === 404 && (
                          <Result
                            status="404"
                            title="404"
                            subTitle={getFormNotFoundMessage(formId)}
                          />
                        )}
                        {persister.loaded &&
                          <MetadataProvider modelType={persister.formProps?.settings?.modelType}>
                            <FormWithFlatMarkup
                              {...props}
                              formFlatMarkup={persister.formProps.flatStructure}
                              formSettings={persister.formProps?.settings}
                              persistedFormProps={persister.formProps}
                              onMarkupUpdated={() => {
                                persisterActions.loadForm({ skipCache: true });
                              }}
                            />
                          </MetadataProvider>
                        }
                      </>
                    )}
                  </FormPersisterConsumer>
                )}
              </FormPersisterActionsContext.Consumer>
            </FormPersisterProvider>
          )}
        </div>
      )}
    </ConfigurableComponent>
  );
};

export default ConfigurableForm;
