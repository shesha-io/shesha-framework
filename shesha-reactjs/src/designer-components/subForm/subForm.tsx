import React, { CSSProperties, FC, useMemo } from 'react';
import ShaSpin from '@/components/shaSpin';
import ValidationErrors from '@/components/validationErrors';
import { useSubForm } from '@/providers/subForm';
import { FormItemProvider, ROOT_COMPONENT_KEY, useAppConfigurator, useForm, useSheshaApplication } from '@/providers';
import FormInfo from '@/components/configurableForm/formInfo';
import { ConfigurationItemVersionStatusMap } from '@/utils/configurationFramework/models';
import { IPersistedFormProps } from '@/providers/form/models';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { ComponentsContainerSubForm } from './componentsContainerSubForm';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { Button, Result } from 'antd';
import Link from 'antd/es/typography/Link';
import { useValidator } from '@/providers/validateProvider';
import AttributeDecorator from '@/components/attributeDecorator';

interface ISubFormProps {
  style?: CSSProperties;
  readOnly?: boolean;
}

const SubForm: FC<ISubFormProps> = ({ readOnly }) => {
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { formInfoBlockVisible } = useAppConfigurator();
  const {
    id,
    module,
    name,
    errors,
    loading,
    formSettings,
    propertyName,
    context,
    versionStatus,
    hasFetchedConfig,
    versionNo,
    description,
    allComponents,
  } = useSubForm();

  const form = useForm();

  const validator = useValidator(false);
  if (validator && id && allComponents)
    validator.registerValidator({
      id,
      validate: () => {
        if (!context) {
          const properties = [];
          for (const comp in allComponents)
            if (Object.hasOwn(allComponents, comp)) {
              const component = allComponents[comp];
              if (component.propertyName && !component.context)
                properties.push([...propertyName.split('.'), ...component.propertyName.split('.')]);
            }

          if (properties.length > 0)
            return form.form.validateFields(properties, { recursive: false }).catch((e) => {
              if (e.errorFields?.length > 0) throw e;
              return null;
            });
        }
        return Promise.resolve();
      },
    });

  const formStatusInfo = versionStatus ? ConfigurationItemVersionStatusMap[versionStatus] : null;

  const showFormInfo = hasFetchedConfig && formInfoBlockVisible && Boolean(formStatusInfo && id && name);

  const isLoading = useMemo(() => {
    return Object.values(loading).find((l) => Boolean(l));
  }, [loading]);

  const persistedFormProps: IPersistedFormProps = { id, module, versionNo, description, versionStatus, name };

  if (formSettings?.access === 4 && !anyOfPermissionsGranted(formSettings?.permissions || [])) {
    return (
      <Result
        status="403"
        style={{ height: '100vh - 55px' }}
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary">
            <Link href={'/'}>Back Home</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ShaSpin spinning={isLoading}>
      <AttributeDecorator
        attributes={{
          'data-sha-c-form-name': `${module}/${name}`,
        }}
      >
        <FormInfo visible={showFormInfo} formProps={persistedFormProps}>
          <div style={{ flex: 1 }} data-name={propertyName}>
            {Object.keys(errors).map((error, index) => (
              <ValidationErrors key={index} error={errors[error]} />
            ))}
            <div>
              <ComponentsContainerProvider ContainerComponent={ComponentsContainerSubForm}>
                <FormItemProvider
                  namePrefix={propertyName}
                  labelCol={formSettings?.labelCol}
                  wrapperCol={formSettings?.wrapperCol}
                >
                  <ComponentsContainer containerId={ROOT_COMPONENT_KEY} readOnly={readOnly} />
                </FormItemProvider>
              </ComponentsContainerProvider>
            </div>
          </div>
        </FormInfo>
      </AttributeDecorator>
    </ShaSpin>
  );
};

SubForm.displayName = 'SubForm';

export { SubForm };

export default SubForm;
