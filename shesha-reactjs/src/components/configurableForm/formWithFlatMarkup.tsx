import { IFlatComponentsStructure, IFormActions, IFormSections, IFormSettings, IPersistedFormProps } from '@/providers/form/models';
import React, { ReactElement } from 'react';
import { FormProvider } from '@/providers/form';
import FormInfo from './formInfo';
import { ConfigurableFormRenderer } from './configurableFormRenderer';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { IConfigurableFormRuntimeProps } from './models';
import { FormFlatMarkupProvider } from '@/providers/form/providers/formMarkupProvider';
import { ConditionalMetadataProvider } from '@/providers';
import { IShaFormInstance } from '@/index';

export type IFormWithFlatMarkupProps<TValues extends object = object> = Omit<IConfigurableFormRuntimeProps<TValues>, 'shaForm'> & {
  shaForm: IShaFormInstance<any>;
  formFlatMarkup: IFlatComponentsStructure;
  formSettings: IFormSettings;
  persistedFormProps?: IPersistedFormProps;
  onMarkupUpdated?: () => void;
  actions?: IFormActions;
  sections?: IFormSections;
};

export const FormWithFlatMarkup = <TValues extends object = object>(props: IFormWithFlatMarkupProps<TValues>): ReactElement => {
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

  const showFormInfo = Boolean(persistedFormProps) && formInfoBlockVisible;

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
