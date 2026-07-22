import React, { CSSProperties, FC, useMemo } from 'react';
import ShaSpin from '@/components/shaSpin';
import ValidationErrors from '@/components/validationErrors';
import { useSubForm } from '@/providers/subForm';
import { FormItemProvider, isConfigurableFormComponent, ROOT_COMPONENT_KEY, useForm, useSheshaApplication } from '@/providers';
import FormInfo from '@/components/configurableForm/formInfo';
import { IPersistedFormProps } from '@/providers/form/models';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { ComponentsContainerSubForm } from './componentsContainerSubForm';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { Button, Result } from 'antd';
import Link from 'antd/es/typography/Link';
import { useValidator } from '@/providers/validateProvider';
import AttributeDecorator from '@/components/attributeDecorator';
import { isDefined } from '@/utils/nullables';
import { ValidateErrorEntity } from '@/interfaces';
import { isNonEmptyArray } from '@/utils/array';

interface ISubFormProps {
  style?: CSSProperties | undefined;
  readOnly?: boolean | undefined;
}

const SubForm: FC<ISubFormProps> = ({ readOnly }) => {
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const {
    id,
    module,
    name,
    errors,
    loading,
    formSettings,
    propertyName = "",
    context,
    description,
    allComponents,
  } = useSubForm();

  const form = useForm();

  const validator = useValidator(false);
  if (validator && id && isDefined(allComponents))
    validator.registerValidator({
      id,
      validate: () => {
        if (!context) {
          const properties = [];
          for (const comp in allComponents)
            if (Object.hasOwn(allComponents, comp)) {
              const component = allComponents[comp];
              if (isConfigurableFormComponent(component) && component.propertyName && !component.context)
                properties.push([...propertyName.split('.'), ...component.propertyName.split('.')]);
            }

          if (properties.length > 0 && form.form)
            return form.form.validateFields(properties, { recursive: false })
              .then(() => {})
              .catch((e: ValidateErrorEntity) => {
                if (isNonEmptyArray(e.errorFields))
                  throw e;
              });
        }
        return Promise.resolve();
      },
    });

  const isLoading = useMemo(() => {
    return isDefined(loading) && Object.values(loading).find((l) => Boolean(l)) !== undefined;
  }, [loading]);

  const persistedFormProps: IPersistedFormProps = { id, module, description, name };

  if (isDefined(formSettings) && formSettings.access === 4 && !anyOfPermissionsGranted(formSettings.permissions || [])) {
    return (
      <Result
        status="403"
        style={{ height: '100vh - 55px' }}
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={(
          <Button type="primary">
            <Link href="/">Back Home</Link>
          </Button>
        )}
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
        <FormInfo visible={false} formProps={persistedFormProps}>
          <div style={{ flex: 1 }} data-name={propertyName}>
            {isDefined(errors) && Object.keys(errors).map((error, index) => (
              <ValidationErrors key={index} error={errors[error as keyof typeof errors]} />
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
