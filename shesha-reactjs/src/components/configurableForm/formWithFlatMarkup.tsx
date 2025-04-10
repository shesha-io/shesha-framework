import { IFlatComponentsStructure, IFormActions, IFormSections, IFormSettings, IPersistedFormProps } from '@/providers/form/models';
import React, { FC } from 'react';
import { ConfigurationItemVersionStatusMap } from '@/utils/configurationFramework/models';
import { FormProvider } from '@/providers/form';
import FormInfo from './formInfo';
import { ConfigurableFormRenderer } from './configurableFormRenderer';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { IConfigurableFormRuntimeProps } from './models';
import { FormFlatMarkupProvider } from '@/providers/form/providers/formMarkupProvider';
import { ConditionalMetadataProvider } from '@/providers';
import { IShaFormInstance } from '@/index';

export type IFormWithFlatMarkupProps = Omit<IConfigurableFormRuntimeProps, 'shaForm'> & {
  shaForm: IShaFormInstance<any>;
  formFlatMarkup: IFlatComponentsStructure;
  formSettings: IFormSettings;
  persistedFormProps?: IPersistedFormProps;
  onMarkupUpdated?: () => void;
  actions?: IFormActions;
  sections?: IFormSections;
};

export const FormWithFlatMarkup: FC<IFormWithFlatMarkupProps> = (props) => {
  const {
    mode,
    formRef,
    isActionsOwner,
    propertyFilter,
    actions,
    sections,
    form,
    formFlatMarkup,
    formSettings,
    persistedFormProps,
    onMarkupUpdated,
    shaForm,
  } = props;

  const { formInfoBlockVisible } = useAppConfigurator();
  
  if (!formFlatMarkup) 
    return null;

  const formStatusInfo = persistedFormProps?.versionStatus
    ? ConfigurationItemVersionStatusMap[persistedFormProps.versionStatus]
    : null;

  const showFormInfo = Boolean(persistedFormProps) && formInfoBlockVisible && formStatusInfo;

  return (
    <FormInfo visible={showFormInfo} formProps={persistedFormProps} onMarkupUpdated={onMarkupUpdated}>
      <ConditionalMetadataProvider modelType={formSettings?.modelType}>
        <FormFlatMarkupProvider markup={formFlatMarkup}>
          <FormProvider
            shaForm={shaForm}
            name={props.formName}
            formSettings={formSettings}
            mode={mode}
            form={form}
            formRef={formRef}
            isActionsOwner={isActionsOwner}
            propertyFilter={propertyFilter}
            actions={actions}
            sections={sections}
          >
            <ConfigurableFormRenderer shaForm={shaForm} {...props} />
          </FormProvider>
        </FormFlatMarkupProvider>
      </ConditionalMetadataProvider>
    </FormInfo>
  );
};

export const FormWithFlatMarkupMemo = React.memo(FormWithFlatMarkup);