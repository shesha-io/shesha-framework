import React, { CSSProperties, FC, useMemo } from 'react';
import ShaSpin from '../../../shaSpin';
import ValidationErrors from '../../../validationErrors';
import { useSubForm } from '../../../../providers/subForm';
import { SubFormContainer } from './subFormContainer';
import { FormItemProvider, useAppConfigurator } from '../../../../providers';
import { upgradeComponentsTree } from '../../../../providers/form/utils';
import { useFormDesignerComponents } from '../../../../providers/form/hooks';
import Show from '../../../show';
import FormInfo from '../../../configurableForm/formInfo';
import { ConfigurationItemVersionStatusMap } from '../../../../utils/configurationFramework/models';
import { IPersistedFormProps } from '../../../../providers/form/models';

interface ISubFormProps {
  style?: CSSProperties;
  readOnly?: boolean;
}

const SubForm: FC<ISubFormProps> = ({ readOnly }) => {
  const { formInfoBlockVisible } = useAppConfigurator();
  const {
    id,
    module,
    errors,
    loading,
    components,
    formSettings,
    name,
    versionStatus,
    hasFetchedConfig,
    versionNo,
    description,
  } = useSubForm();
  const designerComponents = useFormDesignerComponents();

  const formStatusInfo = versionStatus ? ConfigurationItemVersionStatusMap[versionStatus] : null;

  const showFormInfo = hasFetchedConfig && formInfoBlockVisible && Boolean(formStatusInfo && id && name);

  const isLoading = useMemo(() => {
    return Object.values(loading).find(l => Boolean(l));
  }, [loading]);

  const updatedComponents = useMemo(() => {
    return upgradeComponentsTree(designerComponents, formSettings, components);
  }, [components]);

  const persistedFormProps: IPersistedFormProps = { id, module, versionNo, description, versionStatus, name };

  return (
    <ShaSpin spinning={isLoading}>
      <Show when={showFormInfo}>
        <FormInfo {...persistedFormProps} />
      </Show>
      <div style={{ flex: 1 }} data-name={name}>
        {Object.keys(errors).map((error, index) => (
          <ValidationErrors key={index} error={errors[error]} />
        ))}

        <div>
          <FormItemProvider namePrefix={name} labelCol={formSettings?.labelCol} wrapperCol={formSettings?.wrapperCol}>
            <SubFormContainer components={updatedComponents} readOnly={readOnly} />
          </FormItemProvider>
        </div>
      </div>
    </ShaSpin>
  );
};

SubForm.displayName = 'SubForm';

export { SubForm };

export default SubForm;
