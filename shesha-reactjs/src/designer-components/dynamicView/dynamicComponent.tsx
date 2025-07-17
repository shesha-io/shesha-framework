import React, { FC, useMemo, useRef } from 'react';
import { CustomErrorBoundary } from '@/components';
import { IConfigurableFormComponent } from '@/interfaces';
import { useActualContextData, useActualContextExecution, useCalculatedModel, useCanvas, useShaFormInstance, useSheshaApplication } from '@/index';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { IModelValidation } from '@/utils/errors';
import ComponentError from '@/components/componentErrors';
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

  const componentRef = useRef();
  const toolboxComponent = getToolboxComponent(componentModel.type);

  const deviceModel = Boolean(activeDevice) && typeof activeDevice === 'string'
    ? { ...componentModel, ...componentModel?.[activeDevice] }
    : componentModel;
  
  const actualModel = useActualContextData(
    deviceModel,
    undefined,
    undefined,
    (name: string) => formComponentActualModelPropertyFilter(toolboxComponent, name),
    undefined,
  );

  // TODO: AS review hidden and enabled for SubForm
  actualModel.hidden = shaForm.formMode !== 'designer'
    && (
      actualModel.hidden
      || !anyOfPermissionsGranted(actualModel?.permissions || []));
      // || !isComponentFiltered(actualModel)); ToDo: AS - check if needed for dynamic components

  // binding only input and output components
  if (!toolboxComponent.isInput && !toolboxComponent.isOutput) 
    actualModel.propertyName = undefined;

  actualModel.jsStyle = useActualContextExecution(actualModel.style, null, {}); // use default style if empty or error

  const calculatedModel = useCalculatedModel(actualModel, toolboxComponent?.calculateModel);

  const control = useMemo(() => (
    <toolboxComponent.Factory 
      componentRef={componentRef}
      form={shaForm.antdForm}
      model={actualModel}
      calculatedModel={calculatedModel}
      shaApplication={shaApplication}
      key={actualModel.id}
    />
  ), [actualModel, actualModel.hidden, actualModel.jsStyle, calculatedModel]);

  if (!toolboxComponent) 
    return <ComponentError errors={{
        hasErrors: true, componentId: componentModel.id, componentName: componentModel.componentName, componentType: componentModel.type
      }} message={`Component '${componentModel.type}' not found`} type='error'
    />;

  if (shaForm.formMode === 'designer') {
    const validationResult: IModelValidation = {hasErrors: false, errors: []};
    toolboxComponent.validateModel?.(actualModel, (propertyName, error) => {
      validationResult.hasErrors = true;
      validationResult.errors.push({ propertyName, error });
    });
    if (validationResult.hasErrors) {
      validationResult.componentId = componentModel.id;
      validationResult.componentName = componentModel.componentName;
      validationResult.componentType = componentModel.type;
      return <ComponentError errors={validationResult} message='' type='warning'/>;
    }
  }

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

  return (
    <CustomErrorBoundary>
      <AttributeDecorator attributes={attributes}>
        {control}
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
