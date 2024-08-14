import { IFlatComponentsStructure, IFormSettings, IPersistedFormProps } from '@/providers/form/models';
import React, { FC } from 'react';
import { ConfigurationItemVersionStatusMap } from '@/utils/configurationFramework/models';
import { FormProvider } from '@/providers/form';
import Show from '../show';
import FormInfo from './formInfo';
import { ConfigurableFormRenderer } from './configurableFormRenderer';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { IConfigurableFormRuntimeProps } from './models';
import { FormFlatMarkupProvider } from '@/providers/form/providers/formMarkupProvider';
import { useAuth } from '@/providers';
import { useShaForm } from '@/providers/form/store/shaFormInstance';
import { MetadataProvider } from '@/providers';

export type IFormWithFlatMarkupProps = IConfigurableFormRuntimeProps & {
  formFlatMarkup: IFlatComponentsStructure;
  formSettings: IFormSettings;
  persistedFormProps?: IPersistedFormProps;
  onMarkupUpdated?: () => void;
};

export const FormWithFlatMarkup: FC<IFormWithFlatMarkupProps> = (props) => {
  const {
    mode,
    formRef,
    isActionsOwner,
    propertyFilter,
  } = props;

  const {
    refetchData,

    parentFormValues,
    onValuesChange,
    form,
  } = props;

  const [shaForm] = useShaForm({ form: props.shaForm });

  const { formInfoBlockVisible } = useAppConfigurator();
  const auth = useAuth(false);
  const { formFlatMarkup, formSettings, persistedFormProps, onMarkupUpdated } = props;
  if (!formFlatMarkup) return null;

  const formStatusInfo = persistedFormProps?.versionStatus
    ? ConfigurationItemVersionStatusMap[persistedFormProps.versionStatus]
    : null;

  const showFormInfo = Boolean(persistedFormProps) && formInfoBlockVisible && formStatusInfo && !!auth?.loginInfo;

  return (
    <MetadataProvider modelType={formSettings?.modelType}>
      <FormFlatMarkupProvider markup={formFlatMarkup}>
        <FormProvider
          shaForm={shaForm}
          name={props.formName}
          formSettings={formSettings}
          onValuesChange={onValuesChange}
          mode={mode}
          form={form}
          formRef={formRef}
          // actions={actions}
          // sections={sections}
          refetchData={refetchData}
          isActionsOwner={isActionsOwner}
          propertyFilter={propertyFilter}
          parentFormValues={parentFormValues}
          initialValues={props.initialValues}
        >
          <Show when={Boolean(showFormInfo)}>
            <FormInfo formProps={persistedFormProps} onMarkupUpdated={onMarkupUpdated} />
          </Show>
          <ConfigurableFormRenderer
            shaForm={shaForm}
            {...props}
          />
        </FormProvider>
      </FormFlatMarkupProvider>
    </MetadataProvider>
  );
};

export const FormWithFlatMarkupMemo = React.memo(FormWithFlatMarkup);