import React, { CSSProperties, FC, useMemo } from 'react';
import ShaSpin from '@/components/shaSpin';
import ValidationErrors from '@/components/validationErrors';
import { useSubForm } from '@/providers/subForm';
import { FormItemProvider, ROOT_COMPONENT_KEY, useAppConfigurator } from '@/providers';
import Show from '@/components/show';
import FormInfo from '../../../configurableForm/formInfo';
import { ConfigurationItemVersionStatusMap } from '@/utils/configurationFramework/models';
import { IPersistedFormProps } from '@/providers/form/models';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { ComponentsContainerSubForm } from './componentsContainerSubForm';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';

interface ISubFormProps {
  style?: CSSProperties;
  readOnly?: boolean;
}

const SubForm: FC<ISubFormProps> = ({ readOnly }) => {
  const { formInfoBlockVisible } = useAppConfigurator();
  const {
    id,
    module,
    name,
    errors,
    loading,
    formSettings,
    propertyName,
    versionStatus,
    hasFetchedConfig,
    versionNo,
    description,
  } = useSubForm();

  const formStatusInfo = versionStatus ? ConfigurationItemVersionStatusMap[versionStatus] : null;

  const showFormInfo = hasFetchedConfig && formInfoBlockVisible && Boolean(formStatusInfo && id && name);

  const isLoading = useMemo(() => {
    return Object.values(loading).find(l => Boolean(l));
  }, [loading]);

  const persistedFormProps: IPersistedFormProps = { id, module, versionNo, description, versionStatus, name };

  return (
    <ShaSpin spinning={isLoading}>
      <Show when={showFormInfo}>
        <FormInfo formProps={persistedFormProps} />
      </Show>
      <div style={{ flex: 1 }} data-name={propertyName}>
        {Object.keys(errors).map((error, index) => (
          <ValidationErrors key={index} error={errors[error]} />
        ))}

        <div>
          <ComponentsContainerProvider
            ContainerComponent={ComponentsContainerSubForm}
          >
            <FormItemProvider namePrefix={propertyName} labelCol={formSettings?.labelCol} wrapperCol={formSettings?.wrapperCol}>
              <ComponentsContainer containerId={ROOT_COMPONENT_KEY} readOnly={readOnly}/>
            </FormItemProvider>
          </ComponentsContainerProvider>
        </div>
      </div>
    </ShaSpin>
  );
};

SubForm.displayName = 'SubForm';

export { SubForm };

export default SubForm;
