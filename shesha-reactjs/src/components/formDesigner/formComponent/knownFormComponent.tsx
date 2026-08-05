import { isSubFormComponent, ISubFormComponentProps } from '@/designer-components/subForm';
import { useCalculatedModel } from '@/hooks/formComponentHooks';
import { IApiContext, IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { UnwrapCodeEvaluators, useForm, useShaFormInstance, useSheshaApplication } from '@/providers';
import { isFormFullName } from '@/providers/form/utils';
import { useValidationErrorsStateOrDefault } from '@/providers/validationErrors';
import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import React, { FC, useMemo } from 'react';
import AttributeDecorator from '../../attributeDecorator';
import ErrorIconPopover from '../../componentErrors/errorIconPopover';
import { isValidGuid } from '../components/utils';
import { useShaComponentStyles } from '../styles/shaComponentStyles';

type CustomHtmlAttributes = {
  "data-sha-c-id"?: string | undefined;
  "data-sha-c-name"?: string | undefined;
  "data-sha-c-property-name"?: string | undefined;
  "data-sha-c-type"?: string | undefined;
  "data-sha-c-form-name"?: string | undefined;
  "data-sha-parent-form-id"?: string | undefined;
  "data-sha-parent-form-name"?: string | undefined;
};

interface KnownFormComponentProps {
  componentModel: UnwrapCodeEvaluators<IConfigurableFormComponent>;
  toolboxComponent: IToolboxComponent;
  apiContext: IApiContext<IConfigurableFormComponent>;
};

const KnownFormComponent: FC<KnownFormComponentProps> = ({ componentModel, toolboxComponent, apiContext }) => {
  const { styles: shaComponentStyles } = useShaComponentStyles({ componentModel, toolboxComponent, isDesigner: false });
  const shaApplication = useSheshaApplication();
  const shaForm = useShaFormInstance();
  const { formMode } = useForm();
  const { errors: validationErrors } = useValidationErrorsStateOrDefault(); // Get errors map to trigger re-renders when errors change
  const calculatedModel = useCalculatedModel(componentModel, toolboxComponent.useCalculateModel, toolboxComponent.calculateModel);

  const control = useMemo(() => {
    return (
      <toolboxComponent.Factory
        form={shaForm.antdForm}
        model={componentModel}
        calculatedModel={calculatedModel}
        shaApplication={shaApplication}
        apiContext={apiContext}
        key={componentModel.id}
      />
    );
  }, [toolboxComponent, shaForm.antdForm, componentModel, calculatedModel, shaApplication, apiContext]);

  // Run validation in both designer and runtime modes
  // Collect errors from:
  // 1. Toolbox validateModel function
  // 2. Child components registered via useComponentValidation hook
  const validationResult = useMemo((): IModelValidation | undefined => {
    const errors: Array<{ propertyName?: string; error: string }> = [];
    let validationType: ISheshaErrorTypes | undefined;

    if (componentModel.background?.type === 'storedFile' && isDefined(componentModel.background.storedFile?.id) && !isValidGuid(componentModel.background.storedFile.id)) {
      errors.push({ propertyName: 'The provided StoredFileId is invalid', error: 'The provided StoredFileId is invalid' });
    }

    // Collect errors from toolbox validateModel
    toolboxComponent.validateModel?.(componentModel, (propertyName, error) => {
      errors.push({ propertyName, error });
    });

    // Collect errors from child components registered via hook
    const childValidation = validationErrors.get(componentModel.id);
    if (isDefined(childValidation) && childValidation.hasErrors && childValidation.errors) {
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
        componentId: componentModel.id,
        componentName: componentModel.componentName,
        componentType: componentModel.type,
        validationType,
        errors,
      };
    }

    return undefined;
  }, [toolboxComponent, componentModel, validationErrors]);

  const wrappedControl = formMode === 'designer'
    ? control
    : <div className={shaComponentStyles.shaComponent}>{control}</div>;

  // Wrap component with error icon if there are validation errors
  // Show error icons only in designer mode
  // Use the validationType from the validation result (error/warning/info) or default to 'warning'
  const wrappedErrorControl = isDefined(validationResult) && validationResult.hasErrors && formMode === 'designer' ? (
    <ErrorIconPopover
      mode="validation"
      validationResult={validationResult}
      type={validationResult.validationType ?? 'warning'}
      isDesignerMode={true}
    >
      {wrappedControl}
    </ErrorIconPopover>
  ) : wrappedControl;

  if (shaForm.form && (shaForm.form.settings.isSettingsForm ?? false))
    return wrappedErrorControl;

  const attributes: CustomHtmlAttributes = {
    'data-sha-c-id': `${componentModel.id}`,
    'data-sha-c-name': `${componentModel.componentName}`,
    'data-sha-c-property-name': `${componentModel.propertyName}`,
    'data-sha-c-type': `${componentModel.type}`,
  };

  if (isSubFormComponent(componentModel)) {
    const subform = componentModel as ISubFormComponentProps;
    if (subform.formSelectionMode !== 'dynamic' && isFormFullName(subform.formId)) {
      attributes['data-sha-c-form-name'] = `${subform.formId.module}/${subform.formId.name}`;
    }
    if (!isNullOrWhiteSpace(shaForm.form?.id))
      attributes['data-sha-parent-form-id'] = `${shaForm.form.id}`;
    if (isFormFullName(shaForm.formId))
      attributes['data-sha-parent-form-name'] = `${shaForm.formId.module}/${shaForm.formId.name}`;
  }

  return <AttributeDecorator attributes={attributes as Record<string, string>}>{wrappedErrorControl}</AttributeDecorator>;
};

const KnownFormComponentMemo = React.memo(KnownFormComponent);
export default KnownFormComponentMemo;
