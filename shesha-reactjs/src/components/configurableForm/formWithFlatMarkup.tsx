import { IFlatComponentsStructure, IFormActions, IFormSections, IFormSettings, IPersistedFormProps } from '@/providers/form/models';
import React, { ReactNode } from 'react';
import { FormProvider } from '@/providers/form';
import FormInfo from './formInfo';
import { ConfigurableFormRenderer } from './configurableFormRenderer';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { IConfigurableFormRuntimeProps } from './models';
import { FormFlatMarkupProvider } from '@/providers/form/providers/formMarkupProvider';
import { ConditionalMetadataProvider } from '@/providers';
import { IShaFormInstance } from '@/providers/form/store/interfaces';
import { isDefined } from '@/utils/nullables';

export type IFormWithFlatMarkupProps<TValues extends object = object> = Omit<IConfigurableFormRuntimeProps<TValues>, 'shaForm'> & {
  shaForm: IShaFormInstance<TValues>;
  formFlatMarkup: IFlatComponentsStructure;
  formSettings: IFormSettings;
  persistedFormProps?: IPersistedFormProps | undefined;
  onMarkupUpdated?: (() => void) | undefined;
  actions?: IFormActions | undefined;
  sections?: IFormSections | undefined;
};

export const FormWithFlatMarkup = <TValues extends object = object>(props: IFormWithFlatMarkupProps<TValues>): ReactNode => {
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

  const showFormInfo = isDefined(persistedFormProps) && formInfoBlockVisible;

  return (
    <FormInfo visible={showFormInfo} formProps={persistedFormProps} onMarkupUpdated={onMarkupUpdated}>
      <ConditionalMetadataProvider modelType={formSettings.modelType}>
        <FormFlatMarkupProvider markup={formFlatMarkup}>
          <FormProvider<TValues>
            shaForm={shaForm}
            name={props.formName}
            formSettings={formSettings}
            mode={mode}
            form={form}
            formRef={formRef}
            isActionsOwner={isActionsOwner ?? false}
            propertyFilter={propertyFilter}
            actions={actions}
            sections={sections}
          >
            <ConfigurableFormRenderer {...props} />
          </FormProvider>
        </FormFlatMarkupProvider>
      </ConditionalMetadataProvider>
    </FormInfo>
  );
};

export const FormWithFlatMarkupMemo = React.memo(FormWithFlatMarkup);
