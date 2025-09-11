import React, { FC, useRef } from 'react';
import { CustomErrorBoundary } from '@/components';
import { IConfigurableFormComponent } from '@/interfaces';
import { useCanvas, useForm, useSheshaApplication } from '@/index';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { IModelValidation } from '@/utils/errors';
import ComponentError from '@/components/componentErrors';
import { useActualContextData } from '@/hooks/useActualContextData';
import { formComponentActualModelPropertyFilter } from '@/components/formDesigner/formComponent';

export interface IConfigurableFormComponentProps {
  model: IConfigurableFormComponent;
}

const DynamicComponent: FC<IConfigurableFormComponentProps> = ({ model: componentModel }) => {
  const { activeDevice } = useCanvas();
  const formInstance = useForm();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { form } = formInstance;
  const getToolboxComponent = useFormDesignerComponentGetter();

  const componentRef = useRef();
  const toolboxComponent = getToolboxComponent(componentModel.type);

  const deviceModel = Boolean(activeDevice) && typeof activeDevice === 'string'
    ? { ...componentModel, ...componentModel?.[activeDevice] }
    : componentModel;
  
  const actualModel = useActualContextData(deviceModel, undefined, undefined, (name: string, value: any) => formComponentActualModelPropertyFilter(toolboxComponent, name, value));

  if (!toolboxComponent) 
    return <ComponentError errors={{
        hasErrors: true, componentId: componentModel.id, componentName: componentModel.componentName, componentType: componentModel.type
      }} message={`Component '${componentModel.type}' not found`} type='error'
    />;

  // TODO: AS review hidden and enabled for SubForm
  actualModel.hidden = formInstance.formMode !== 'designer'
    && (
      actualModel.hidden
      || !anyOfPermissionsGranted(actualModel?.permissions || []));

  actualModel.readOnly = actualModel.readOnly;

  // binding only input and output components
  if (!toolboxComponent.isInput && !toolboxComponent.isOutput) 
    actualModel.propertyName = undefined;

  if (formInstance.formMode === 'designer') {
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

  return (
    <CustomErrorBoundary>
      <toolboxComponent.Factory model={actualModel} componentRef={componentRef} form={form} />
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
