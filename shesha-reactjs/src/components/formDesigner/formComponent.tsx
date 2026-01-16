import React, { FC, useMemo } from 'react';
import { IConfigurableFormComponent } from '@/interfaces';
import { useCanvas, useForm, useShaFormInstance, useSheshaApplication } from '@/providers';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { formComponentActualModelPropertyFilter } from '@/providers/form/utils';
import { IModelValidation } from '@/utils/errors';
import { CustomErrorBoundary } from '..';
import ErrorIconPopover from '../componentErrors/errorIconPopover';
import AttributeDecorator from '../attributeDecorator';
import { IStyleType, isValidGuid, useActualContextData, useCalculatedModel } from '@/index';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { useStyles } from './styles/styles';
import { FormComponentValidationProvider, useValidationErrorsActions, useValidationErrorsState } from '@/providers/validationErrors';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
}

const FormComponentInner: FC<IFormComponentProps> = ({ componentModel }) => {
  const { styles } = useStyles();
  const shaApplication = useSheshaApplication();
  const shaForm = useShaFormInstance();
  const { isComponentFiltered, formMode } = useForm();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { activeDevice } = useCanvas();
  const { getValidation } = useValidationErrorsActions();
  const { errors } = useValidationErrorsState(); // Get errors map to trigger re-renders when errors change
  const errorCount = errors.size; // Track size to trigger useMemo

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

  // Run validation in both designer and runtime modes
  // Collect errors from:
  // 1. Toolbox validateModel function
  // 2. Child components registered via useComponentValidation hook
  const validationResult = useMemo((): IModelValidation | undefined => {
    const errors: Array<{ propertyName?: string; error: string }> = [];
    let validationType: 'error' | 'warning' | 'info' | undefined;

    if (actualModel?.background?.type === 'storedFile' && actualModel?.background.storedFile?.id && !isValidGuid(actualModel?.background.storedFile.id)) {
      errors.push({ propertyName: 'The provided StoredFileId is invalid', error: 'The provided StoredFileId is invalid' });
    }

    // Collect errors from toolbox validateModel
    toolboxComponent?.validateModel?.(actualModel, (propertyName, error) => {
      errors.push({ propertyName, error });
    });

    // Collect errors from child components registered via hook
    const childValidation = getValidation(actualModel.id);
    if (childValidation?.hasErrors && childValidation.errors) {
      errors.push(...childValidation.errors);
      // Use the child's validationType if present (prioritize 'error' > 'warning' > 'info')
      if (childValidation.validationType) {
        if (!validationType ||
          (childValidation.validationType === 'error') ||
          (childValidation.validationType === 'warning' && validationType === 'info')) {
          validationType = childValidation.validationType;
        }
      }
    }

    if (errors.length > 0) {
      return {
        hasErrors: true,
        componentId: actualModel.id,
        componentName: actualModel.componentName,
        componentType: actualModel.type,
        validationType,
        errors,
      };
    }

    return undefined;
  }, [toolboxComponent, actualModel, getValidation, errorCount]);

  // Wrap component with error icon if there are validation errors
  // Show error icons only in designer mode
  // Use the validationType from the validation result (error/warning/info) or default to 'warning'
  const wrappedControl = validationResult?.hasErrors && formMode === 'designer' ? (
    <ErrorIconPopover
      mode="validation"
      validationResult={validationResult}
      type={validationResult.validationType ?? 'warning'}
      isDesignerMode={true}
    >
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

const FormComponent: FC<IFormComponentProps> = ({ componentModel }) => {
  return (
    <FormComponentValidationProvider
      componentId={componentModel.id}
      componentName={componentModel.componentName}
      componentType={componentModel.type}
    >
      <FormComponentInner componentModel={componentModel} />
    </FormComponentValidationProvider>
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
