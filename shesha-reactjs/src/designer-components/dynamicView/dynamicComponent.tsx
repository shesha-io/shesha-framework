import React, { FC, useMemo } from 'react';
import { CustomErrorBoundary } from '@/components';
import { IConfigurableFormComponent } from '@/interfaces';
import { useActualContextData, useActualContextExecution, useCalculatedModel, useCanvas, useShaFormInstance, useSheshaApplication } from '@/index';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { IModelValidation } from '@/utils/errors';
import ErrorIconPopover from '@/components/componentErrors/errorIconPopover';
import { formComponentActualModelPropertyFilter } from '@/components/formDesigner/formComponent';
import AttributeDecorator from '@/components/attributeDecorator';
import { useShaFormDataUpdate } from '@/providers/form/providers/shaFormProvider';

export interface IConfigurableFormComponentProps {
  model: IConfigurableFormComponent;
}

const DynamicComponent: FC<IConfigurableFormComponentProps> = ({ model: componentModel }) => {
  useShaFormDataUpdate();

  const shaApplication = useSheshaApplication();
  const shaForm = useShaFormInstance();
  // const { isComponentFiltered } = useForm();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { activeDevice } = useCanvas();

  const toolboxComponent = getToolboxComponent(componentModel.type);

  const deviceModel = Boolean(activeDevice) && typeof activeDevice === 'string'
    ? { ...componentModel, ...componentModel?.[activeDevice] }
    : componentModel;

  const actualModel = useActualContextData(
    deviceModel,
    undefined,
    undefined,
    (name: string, value: any) => formComponentActualModelPropertyFilter(toolboxComponent, name, value),
    undefined,
  );

  // TODO: AS review hidden and enabled for SubForm
  actualModel.hidden = shaForm.formMode !== 'designer' &&
    (
      actualModel.hidden ||
      !anyOfPermissionsGranted(actualModel?.permissions || []));
  // || !isComponentFiltered(actualModel)); ToDo: AS - check if needed for dynamic components

  // binding only input and output components
  if (!toolboxComponent.isInput && !toolboxComponent.isOutput)
    actualModel.propertyName = undefined;

  actualModel.jsStyle = useActualContextExecution(actualModel.style, null, {}); // use default style if empty or error

  const calculatedModel = useCalculatedModel(actualModel, toolboxComponent.calculateModel);

  const control = useMemo(() => (
    <toolboxComponent.Factory
      form={shaForm.antdForm}
      model={actualModel}
      calculatedModel={calculatedModel}
      shaApplication={shaApplication}
      key={actualModel.id}
    />
  ), [actualModel, actualModel.hidden, actualModel.jsStyle, calculatedModel]);

  // Check for missing toolboxComponent immediately after retrieval
  if (!toolboxComponent) {
    const validationResult: IModelValidation = {
      hasErrors: true,
      componentId: componentModel.id,
      componentName: componentModel.componentName,
      componentType: componentModel.type,
      errors: [{ error: `Component '${componentModel.type}' not found` }],
    };
    // Component not found - return early with just error message
    return (
      <div style={{ minHeight: '40px', position: 'relative', padding: '8px', border: '1px dashed #ccc' }}>
        <ErrorIconPopover
          validationResult={validationResult}
          type="error"
        >
          <div style={{ color: '#999', fontSize: '12px' }}>Component &apos;{componentModel.type}&apos; not registered</div>
        </ErrorIconPopover>
      </div>
    );
  }

  // Run validation in both designer and runtime modes
  const errors: Array<{ propertyName?: string; error: string }> = [];
  toolboxComponent.validateModel?.(actualModel, (propertyName, error) => {
    errors.push({ propertyName, error });
  });

  const validationResult: IModelValidation | undefined = errors.length > 0 ? {
    hasErrors: true,
    componentId: componentModel.id,
    componentName: componentModel.componentName,
    componentType: componentModel.type,
    errors,
  } : undefined;

  const attributes = {
    'data-sha-c-id': `${componentModel.id}`,
    'data-sha-c-name': `${componentModel.componentName}`,
    'data-sha-c-type': `${componentModel.type}`,
  };

  if (componentModel.type === 'subForm') {
    attributes['data-sha-c-form-name'] = `${(componentModel as any)?.formId?.module}/${(componentModel as any)?.formId?.name}`;
    attributes['data-sha-parent-form-id'] = `${shaForm.form.id}`;
    attributes['data-sha-parent-form-name'] = `${(shaForm as any)?.formId?.module}/${(shaForm as any)?.formId?.name}`;
  }

  // Wrap component with error icon if there are validation errors
  const wrappedControl = validationResult ? (
    <ErrorIconPopover validationResult={validationResult} type="warning">
      {control}
    </ErrorIconPopover>
  ) : control;

  return (
    <CustomErrorBoundary>
      <AttributeDecorator attributes={attributes}>
        {wrappedControl}
      </AttributeDecorator>
    </CustomErrorBoundary>
  );
};

const DynamicCompomnentErrorWrapper: FC<IConfigurableFormComponentProps> = (model) => {
  return (
    <CustomErrorBoundary componentName={model.model.componentName} componentType={model.model.type} componentId={model.model.id}>
      <DynamicComponent {...model} />
    </CustomErrorBoundary>
  );
};

export default DynamicCompomnentErrorWrapper;
