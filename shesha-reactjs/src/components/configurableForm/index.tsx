import React, { FC } from 'react';
import ConfigurableFormRenderer from './configurableFormRenderer';
import { IConfigurableFormProps } from './models';
import { FormProvider } from '@/providers/form';
import ConfigurableComponent from '../appConfigurator/configurableComponent';
import EditViewMsg from '../appConfigurator/editViewMsg';
import { useAppConfigurator, useShaRouting, useSheshaApplication } from '@/providers';
import classNames from 'classnames';
import { FormPersisterConsumer, FormPersisterProvider } from '@/providers/formPersisterProvider';
import { FormMarkupConverter } from '@/providers/formMarkupConverter';
import { FormRawMarkup, IFormSettings, IPersistedFormProps } from '@/providers/form/models';
import { convertToMarkupWithSettings } from '@/providers/form/utils';
import { ConfigurationItemVersionStatusMap } from '@/utils/configurationFramework/models';
import Show from '@/components/show';
import FormInfo from './formInfo';
import { Result } from 'antd';
import { getFormNotFoundMessage } from '@/providers/configurationItemsLoader/utils';
import { FormPersisterActionsContext } from '@/providers/formPersisterProvider/contexts';
import { useFormDesignerUrl } from '@/providers/form/hooks';

interface RenderWithMarkupArgs {
  providedMarkup: FormRawMarkup;
  formSettings: IFormSettings;
  persistedFormProps?: IPersistedFormProps;
  onMarkupUpdated?: () => void;
}

export const ConfigurableForm: FC<IConfigurableFormProps> = (props) => {
  const {
    needDebug,
    formId,
    markup,
    mode,
    actions,
    sections,
    context,
    formRef,
    refetchData,
    refetcher: refetchMarkup,
    formProps,
    isActionsOwner,
    propertyFilter,
    isSettings,
    ...restProps
  } = props;
  const { switchApplicationMode, formInfoBlockVisible } = useAppConfigurator();
  const app = useSheshaApplication();

  const canConfigure = Boolean(app.routes.formsDesigner) && Boolean(formId);
  const { router } = useShaRouting(false) ?? {};

  const formDesignerUrl = useFormDesignerUrl(formId);
  const openInDesigner = () => {
    if (formDesignerUrl && router) {
      router.push(formDesignerUrl).then(() => switchApplicationMode('live'));
    }
  };

  const markupWithSettings = convertToMarkupWithSettings(markup, isSettings);

  const renderWithMarkup = (args: RenderWithMarkupArgs) => {
    const { providedMarkup, formSettings, persistedFormProps, onMarkupUpdated } = args;
    if (!providedMarkup) return null;

    const formStatusInfo = persistedFormProps?.versionStatus
      ? ConfigurationItemVersionStatusMap[persistedFormProps.versionStatus]
      : null;

    const showFormInfo = Boolean(persistedFormProps) && formInfoBlockVisible && formStatusInfo;

    return (
      <FormMarkupConverter markup={providedMarkup} formSettings={formSettings}>
        {(flatComponents) => (
          <FormProvider
            needDebug={needDebug}
            name="Form"
            {...flatComponents}
            formSettings={formSettings}
            formMarkup={providedMarkup}
            mode={mode}
            form={restProps.form}
            actions={actions}
            sections={sections}
            context={context}
            formRef={formRef}
            onValuesChange={restProps.onValuesChange}
            refetchData={refetchData}
            isActionsOwner={isActionsOwner}
            propertyFilter={propertyFilter}
          >
            <Show when={Boolean(showFormInfo)}>
              <FormInfo formProps={persistedFormProps} onMarkupUpdated={onMarkupUpdated} />
            </Show>
            <ConfigurableFormRenderer {...restProps} />
          </FormProvider>
        )}
      </FormMarkupConverter>
    );
  };

  return (
    <ConfigurableComponent canConfigure={canConfigure} onStartEdit={openInDesigner}>
      {(componentState, BlockOverlay) => (
        <div className={classNames(componentState.wrapperClassName, props?.className)}>
          <BlockOverlay>
            <EditViewMsg />
          </BlockOverlay>
          {markup ? (
            renderWithMarkup({
              providedMarkup: markupWithSettings.components,
              formSettings: markupWithSettings.formSettings,
              persistedFormProps: formProps,
              onMarkupUpdated: refetchMarkup
                ? () => {
                  console.log('LOG: markup updated callback 1');
                  refetchMarkup();
                }
                : undefined
            })
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
                            //style={{ height: '100vh - 55px' }}
                            title="404"
                            subTitle={getFormNotFoundMessage(formId)}
                          />
                        )}
                        {persister.loaded &&
                          renderWithMarkup({
                            providedMarkup: persister.markup,
                            formSettings: persister.formSettings,
                            persistedFormProps: persister.formProps,
                            onMarkupUpdated: () => {
                              console.log('LOG: markup updated callback 2');
                              persisterActions.loadForm({ skipCache: true });
                            }
                          })}
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
