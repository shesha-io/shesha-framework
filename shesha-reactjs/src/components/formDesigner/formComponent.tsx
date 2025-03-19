import React, { FC, MutableRefObject } from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { useCanvas, useForm, useShaFormInstance, useSheshaApplication } from '@/providers';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { IModelValidation } from '@/utils/errors';
import { CustomErrorBoundary } from '..';
import ComponentError from '../componentErrors';
import { useActualContextData } from '@/hooks/useActualContextData';
import AttributeDecorator from '../attributeDecorator';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
  componentRef: MutableRefObject<any>;
}

// skip some properties by default
// nested components will be handled by their own FormComponent
// action configuration details will be handled by their own FormComponent
const propertiesToSkip = ['id', 'componentName', 'type', 'jsSetting', 'isDynamic', 'components', 'actionConfiguration'];
export const standartActualModelPropertyFilter = (name: string) => {
  return propertiesToSkip.indexOf(name) === -1;
};

export const formComponentActualModelPropertyFilter = (component: IToolboxComponent, name: string) => {
  return (component.actualModelPropertyFilter ? component.actualModelPropertyFilter(name) : true)
    && propertiesToSkip.indexOf(name) === -1;
};

const FormComponent: FC<IFormComponentProps> = ({ componentModel, componentRef }) => {
  const formInstance = useForm();
  const shaForm = useShaFormInstance();
  const { form, isComponentFiltered, formMode } = formInstance;
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { activeDevice } = useCanvas();

  const deviceModel = Boolean(activeDevice) && typeof activeDevice === 'string'
    ? { ...componentModel, ...componentModel?.[activeDevice] }
    : componentModel;

  const toolboxComponent = getToolboxComponent(componentModel.type);

  const actualModel = useActualContextData(deviceModel, undefined, undefined, (name: string) => formComponentActualModelPropertyFilter(toolboxComponent, name));

  if (!toolboxComponent)
    return <ComponentError errors={{
      hasErrors: true, componentId: actualModel.id, componentName: actualModel.componentName, componentType: actualModel.type
    }} message={`Component '${actualModel.type}' not found`} type='error'
    />;

  actualModel.hidden = formMode !== 'designer'
    && (
      actualModel.hidden
      || !anyOfPermissionsGranted(actualModel?.permissions || [])
      || !isComponentFiltered(actualModel));

  if (!toolboxComponent.isInput && !toolboxComponent.isOutput)
    actualModel.propertyName = undefined;

  if (formInstance.formMode === 'designer') {
    const validationResult: IModelValidation = { hasErrors: false, errors: [] };
    toolboxComponent.validateModel?.(actualModel, (propertyName, error) => {
      validationResult.hasErrors = true;
      validationResult.errors.push({ propertyName, error });
    });
    if (validationResult.hasErrors) {
      validationResult.componentId = actualModel.id;
      validationResult.componentName = actualModel.componentName;
      validationResult.componentType = actualModel.type;
      return <ComponentError errors={validationResult} message='' type='warning' />;
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
    <AttributeDecorator attributes={attributes}>
      <toolboxComponent.Factory model={actualModel} componentRef={componentRef} form={form} />
    </AttributeDecorator>
  );
};

const FormCompomnentErrorWrapper: FC<IFormComponentProps> = ({ componentModel, componentRef }) => {
  return (
    <CustomErrorBoundary componentName={componentModel.componentName} componentType={componentModel.type} componentId={componentModel.id}>
      <FormComponent componentModel={componentModel} componentRef={componentRef} />
    </CustomErrorBoundary>
  );
};

const FormComponentMemo = React.memo(FormCompomnentErrorWrapper);
export default FormComponentMemo;
