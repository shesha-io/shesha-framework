import { CSSProperties, FC, useMemo } from 'react';
import { FormOutlined } from '@ant-design/icons';
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
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { ValidateErrorEntity } from '@/interfaces';
import { isNonEmptyArray } from '@/utils/array';
import { useStyles } from './styles';

interface ISubFormProps {
  style?: CSSProperties | undefined;
  readOnly?: boolean | undefined;
  formSelectionMode?: 'name' | 'dynamic' | undefined;
}

const SubForm: FC<ISubFormProps> = ({ readOnly, formSelectionMode }) => {
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { styles } = useStyles();
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
    components,
  } = useSubForm();

  const form = useForm();

  const validator = useValidator(false);
  if (validator && !isNullOrWhiteSpace(id) && isDefined(allComponents))
    validator.registerValidator({
      id,
      validate: () => {
        if (isNullOrWhiteSpace(context)) {
          const properties = [];
          for (const comp in allComponents)
            if (Object.hasOwn(allComponents, comp)) {
              const component = allComponents[comp];
              if (isConfigurableFormComponent(component) && !isNullOrWhiteSpace(component.propertyName) && isNullOrWhiteSpace(component.context))
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

  // with no form to render the component collapses to nothing, leaving the failure to a validation
  // icon in the designer chrome. Show it where the form would have been instead
  const formError = errors?.getForm;
  const showFormError = !isLoading && isDefined(formError) && !isNonEmptyArray(components);

  // when the entity type comes from the bound value the dynamic form is resolvable at runtime only,
  // in the designer the component collapses to nothing and can't even be selected. Show a placeholder instead
  const showDynamicPlaceholder = form.formMode === 'designer' &&
    formSelectionMode === 'dynamic' &&
    !isLoading && !showFormError && !isNonEmptyArray(components);

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
            {isDefined(errors) && Object.entries(errors)
              .filter(([name]) => !(showFormError && name === 'getForm'))
              .map(([name, error]) => (
                <ValidationErrors key={name} error={error} />
              ))}
            {showFormError && (
              <div className={styles.shaSubFormError}>
                <ValidationErrors error={formError} />
              </div>
            )}
            {showDynamicPlaceholder && (
              <div className={styles.shaSubFormPlaceholder}>
                <FormOutlined />
                <span>Sub Form — the form is resolved at runtime from the entity type of the bound value.</span>
              </div>
            )}
            {!showDynamicPlaceholder && !isLoading && !showFormError && !isNonEmptyArray(components) && (
              <div className={styles.shaSubFormPlaceholder}>
                <FormOutlined />
                <span>Please, configure subform components</span>
              </div>
            )}
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
