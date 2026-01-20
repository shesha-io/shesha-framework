import React, { FC, useMemo } from 'react';
import { IConfigurableFormComponent } from '@/interfaces';
import { useCanvas, useForm, useShaFormInstance, useSheshaApplication } from '@/providers';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { IModelValidation } from '@/utils/errors';
import { CustomErrorBoundary } from '..';
import ErrorIconPopover from '../componentErrors/errorIconPopover';
import AttributeDecorator from '../attributeDecorator';
import { IStyleType, isValidGuid, IToolboxComponentBase, useActualContextData, useCalculatedModel, useDataTableStore } from '@/index';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { useStyles } from './styles/styles';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
}

// skip some properties by default
// nested components will be handled by their own FormComponent
// action configuration details will be handled by their own FormComponent
const propertiesToSkip = ['id', 'componentName', 'type', 'jsSetting', 'isDynamic', 'components', 'actionConfiguration'];
export const standartActualModelPropertyFilter = (name: string): boolean => {
  return propertiesToSkip.indexOf(name) === -1;
};

export const formComponentActualModelPropertyFilter = (component: IToolboxComponentBase, name: string, value: unknown): boolean => {
  return (component?.actualModelPropertyFilter ? component.actualModelPropertyFilter(name, value) : true) &&
    propertiesToSkip.indexOf(name) === -1;
};

const FormComponent: FC<IFormComponentProps> = ({ componentModel }) => {
  const { styles } = useStyles();
  const shaApplication = useSheshaApplication();
  const shaForm = useShaFormInstance();
  const { isComponentFiltered, formMode } = useForm();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { activeDevice } = useCanvas();

  const deviceModel = Boolean(activeDevice) && typeof activeDevice === 'string'
    ? { ...componentModel, ...componentModel?.[activeDevice] }
    : componentModel;

  const toolboxComponent = getToolboxComponent(componentModel.type);

  const actualModel = useActualContextData<IConfigurableFormComponent & IStyleType>(
    deviceModel,
    undefined,
    undefined,
    (name: string, value: any) => formComponentActualModelPropertyFilter(toolboxComponent, name, value),
    undefined,
  );

  actualModel.hidden = shaForm.formMode !== 'designer' &&
    (
      actualModel.hidden ||
      !anyOfPermissionsGranted(actualModel?.permissions || []) ||
      !isComponentFiltered(actualModel));

  if (!toolboxComponent?.isInput && !toolboxComponent?.isOutput)
    actualModel.propertyName = undefined;

  actualModel.allStyles = useFormComponentStyles(actualModel);

  // Debug: Check if appearance properties and allStyles are present
  if (actualModel.type === 'dropdown') {
    console.log('📊 FormComponent allStyles Debug:', {
      componentType: actualModel.type,
      propertyName: actualModel.propertyName,
      hasFont: !!actualModel?.font,
      hasBorder: !!actualModel?.border,
      hasDimensions: !!actualModel?.dimensions,
      hasBackground: !!actualModel?.background,
      hasAllStyles: !!actualModel.allStyles,
      allStylesKeys: actualModel.allStyles ? Object.keys(actualModel.allStyles) : [],
      fontStyles: actualModel.allStyles?.fontStyles,
      dimensionsStyles: actualModel.allStyles?.dimensionsStyles,
      fullStyle: actualModel.allStyles?.fullStyle,
    });
  }

  const calculatedModel = useCalculatedModel(actualModel, toolboxComponent?.useCalculateModel, toolboxComponent?.calculateModel);

  const control = useMemo(() => {
    if (!toolboxComponent) return null;

    return (
      <toolboxComponent.Factory
        form={shaForm.antdForm}
        model={actualModel}
        calculatedModel={calculatedModel}
        shaApplication={shaApplication}
        key={actualModel.id}
      />
    );
  }, [toolboxComponent, actualModel, actualModel.hidden, actualModel.allStyles, calculatedModel]);

  // Check if component needs data context validation
  // All components that require being inside a data context must report upwards
  const shouldValidateDataContext = useMemo(() => {
    return [
      'datatable',
      'dataList',
      'tableViewSelector',
      'childTable',
      'datatable.filter',
      'datatable.quickSearch',
      'datatable.pager',
    ].includes(componentModel.type);
  }, [componentModel.type]);

  const store = useDataTableStore(false);
  const needsDataContextButMissing = useMemo(() => {
    // Validate all components that need data context
    if (shouldValidateDataContext) {
      // If component requires data context but store is missing, validation should fail
      return !store;
    }
    // Component doesn't need validation, so no issue
    return false;
  }, [shouldValidateDataContext, store]);

  // Run validation in both designer and runtime modes
  const validationResult = useMemo((): IModelValidation | undefined => {
    const errors: Array<{ propertyName?: string; error: string }> = [];

    if (needsDataContextButMissing) {
      // clear all other errors and return early
      errors.push({ propertyName: 'No ancestor Data Context component is set', error: '\nPlace this component inside a Data Context component to connect it to data' });

      return {
        hasErrors: true,
        componentId: actualModel.id,
        componentName: actualModel.componentName,
        componentType: actualModel.type,
        errors,
      };
    }

    if (actualModel?.background?.type === 'storedFile' && actualModel?.background.storedFile?.id && !isValidGuid(actualModel?.background.storedFile.id)) {
      errors.push({ propertyName: 'The provided StoredFileId is invalid', error: 'The provided StoredFileId is invalid' });
    }

    toolboxComponent?.validateModel?.(actualModel, (propertyName, error) => {
      errors.push({ propertyName, error });
    });

    if (errors.length > 0) {
      return {
        hasErrors: true,
        componentId: actualModel.id,
        componentName: actualModel.componentName,
        componentType: actualModel.type,
        errors,
      };
    }

    return undefined;
  }, [toolboxComponent, actualModel, needsDataContextButMissing]);

  // Wrap component with error icon if there are validation errors
  // Show error icons only in designer mode
  const wrappedControl = validationResult?.hasErrors && formMode === 'designer' ? (
    <ErrorIconPopover mode="validation" validationResult={validationResult} type="warning" isDesignerMode={true}>
      {control}
    </ErrorIconPopover>
  ) : control;

  // Check for validation errors (in both designer and runtime modes)
  if (!toolboxComponent) {
    const componentNotFoundError: IModelValidation = {
      hasErrors: true,
      componentId: actualModel.id,
      componentName: actualModel.componentName,
      componentType: actualModel.type,
      errors: [{ error: `Component '${actualModel.type}' not found` }],
    };
    // Component not found - return early with just error message
    const unregisteredMessage = <div className={styles.unregisteredComponentMessage}>Component &apos;{actualModel.type}&apos; not registered</div>;

    return (
      <div className={styles.unregisteredComponentContainer}>
        {shaForm.formMode !== 'designer' ? (
          <ErrorIconPopover
            mode="validation"
            validationResult={componentNotFoundError}
            type="error"
            isDesignerMode={false}
          >
            {unregisteredMessage}
          </ErrorIconPopover>
        ) : unregisteredMessage}
      </div>
    );
  }

  if (shaForm.form.settings.isSettingsForm)
    return control;

  const attributes = {
    'data-sha-c-id': `${componentModel.id}`,
    'data-sha-c-name': `${componentModel.componentName}`,
    'data-sha-c-property-name': `${componentModel.propertyName}`,
    'data-sha-c-type': `${componentModel.type}`,
  };

  if (componentModel.type === 'subForm') {
    if ((componentModel as any)?.formSelectionMode !== 'dynamic') {
      attributes['data-sha-c-form-name'] = `${(componentModel as any)?.formId?.module}/${(componentModel as any)?.formId?.name}`;
    }
    attributes['data-sha-parent-form-id'] = `${shaForm.form.id}`;
    attributes['data-sha-parent-form-name'] = `${(shaForm as any)?.formId?.module}/${(shaForm as any)?.formId?.name}`;
  }

  return (
    <AttributeDecorator attributes={attributes}>
      {wrappedControl}
    </AttributeDecorator>
  );
};

const FormCompomnentErrorWrapper: FC<IFormComponentProps> = ({ componentModel }) => {
  return (
    <CustomErrorBoundary componentName={componentModel.componentName} componentType={componentModel.type} componentId={componentModel.id}>
      <FormComponent componentModel={componentModel} />
    </CustomErrorBoundary>
  );
};

const FormComponentMemo = React.memo(FormCompomnentErrorWrapper);
export default FormComponentMemo;
