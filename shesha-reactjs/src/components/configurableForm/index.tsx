import React, { FC } from 'react';
import ConfigurableFormRenderer from './configurableFormRenderer';
import { IConfigurableFormProps } from './models';
import { FormProvider } from '../../providers/form';
import ConfigurableComponent from '../appConfigurator/configurableComponent';
import EditViewMsg from '../appConfigurator/editViewMsg';
import { useAppConfigurator, useShaRouting, useSheshaApplication } from '../../providers';
import classNames from 'classnames';
import { FormPersisterConsumer, FormPersisterProvider } from '../../providers/formPersisterProvider';
import { FormMarkupConverter } from '../../providers/formMarkupConverter';
import { FormIdentifier, FormRawMarkup, IFormSettings, IPersistedFormProps } from '../../providers/form/models';
import { convertToMarkupWithSettings } from '../../providers/form/utils';
import { ConfigurationItemVersionStatusMap } from '../../utils/configurationFramework/models';
import Show from '../show';
import FormInfo from './formInfo';
import { Result } from 'antd';
import { getFormNotFoundMessage } from '../../providers/configurationItemsLoader/utils';

export const ConfigurableForm: FC<IConfigurableFormProps> = props => {
  const { formId, markup, mode, actions, sections, context, formRef, refetchData, formProps, ...restProps } = props;
  const { switchApplicationMode, formInfoBlockVisible } = useAppConfigurator();
  const app = useSheshaApplication();

  const canConfigure = Boolean(app.routes.formsDesigner) && Boolean(formId);
  const { router } = useShaRouting(false) ?? {};

  const getDesignerUrl = (fId: FormIdentifier) => {
    return typeof fId === 'string'
      ? `${app.routes.formsDesigner}?id=${fId}`
      : Boolean(fId?.name)
        ? `${app.routes.formsDesigner}?module=${fId.module}&name=${fId.name}`
        : null;
  };
  const formDesignerUrl = getDesignerUrl(formId);
  const openInDesigner = () => {
    if (formDesignerUrl && router) {
      router.push(formDesignerUrl).then(() => switchApplicationMode('live'));
    }
  };

  const markupWithSettings = convertToMarkupWithSettings(markup);

  const renderWithMarkup = (
    providedMarkup: FormRawMarkup,
    formSettings: IFormSettings,
    persistedFormProps?: IPersistedFormProps
  ) => {
    if (!providedMarkup) return null;

    const formStatusInfo = persistedFormProps?.versionStatus
      ? ConfigurationItemVersionStatusMap[persistedFormProps.versionStatus]
      : null;

    const showFormInfo = Boolean(persistedFormProps) && formInfoBlockVisible && formStatusInfo;

    return (
      <FormMarkupConverter markup={providedMarkup}>
        {flatComponents => (
          <FormProvider
            name="Form"
            flatComponents={flatComponents}
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
            isActionsOwner={props.isActionsOwner}
          >
            <Show when={Boolean(showFormInfo)}>
              <FormInfo {...persistedFormProps} />
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
            renderWithMarkup(markupWithSettings.components, markupWithSettings.formSettings, formProps)
          ) : (
            <FormPersisterProvider formId={formId}>
              <FormPersisterConsumer>
                {persister => (
                  <>
                    {persister.loadError?.code === 404 && (
                      <Result
                        status="404"
                        //style={{ height: '100vh - 55px' }}
                        title="404"
                        subTitle={getFormNotFoundMessage(formId)}
                      />
                    )}
                    {persister.loaded && renderWithMarkup(persister.markup, persister.formSettings, persister.formProps)}
                  </>
                )
                }
              </FormPersisterConsumer>
            </FormPersisterProvider>
          )}
        </div>
      )}
    </ConfigurableComponent>
  );
};

export default ConfigurableForm;
