import React, { FC, MutableRefObject, useMemo } from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { useCanvas, useForm, useShaFormInstance, useSheshaApplication } from '@/providers';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { IModelValidation } from '@/utils/errors';
import { CustomErrorBoundary } from '..';
import ComponentError from '../componentErrors';
import AttributeDecorator from '../attributeDecorator';
import { IStyleType, isValidGuid, useActualContextData, useCalculatedModel } from '@/index';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { useShaFormUpdateDate } from '@/providers/form/providers/shaFormProvider';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
  componentRef?: MutableRefObject<any>;
}

// skip some properties by default
// nested components will be handled by their own FormComponent
// action configuration details will be handled by their own FormComponent
const propertiesToSkip = ['id', 'componentName', 'type', 'jsSetting', 'isDynamic', 'components', 'actionConfiguration'];
export const standartActualModelPropertyFilter = (name: string) => {
  return propertiesToSkip.indexOf(name) === -1;
};

export const formComponentActualModelPropertyFilter = (component: IToolboxComponent, name: string) => {
  return (component?.actualModelPropertyFilter ? component.actualModelPropertyFilter(name) : true)
    && propertiesToSkip.indexOf(name) === -1;
};

const FormComponent: FC<IFormComponentProps> = ({ componentModel, componentRef }) => {

  useShaFormUpdateDate();

  const shaApplication = useSheshaApplication();
  const shaForm = useShaFormInstance();
  const { isComponentFiltered } = useForm();
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
    (name: string) => formComponentActualModelPropertyFilter(toolboxComponent, name),
    undefined
  );

  actualModel.hidden = shaForm.formMode !== 'designer'
    && (
      actualModel.hidden
      || !anyOfPermissionsGranted(actualModel?.permissions || [])
      || !isComponentFiltered(actualModel));

  if (!toolboxComponent?.isInput && !toolboxComponent?.isOutput)
    actualModel.propertyName = undefined;

  actualModel.allStyles = useFormComponentStyles(actualModel);

  const calculatedModel = useCalculatedModel(actualModel, toolboxComponent?.useCalculateModel, toolboxComponent?.calculateModel);

  const control = useMemo(() => (
    <toolboxComponent.Factory 
      componentRef={componentRef}
      form={shaForm.antdForm}
      model={actualModel}
      calculatedModel={calculatedModel}
      shaApplication={shaApplication}
      key={actualModel.id}
    />
  ), [actualModel, actualModel.hidden, actualModel.allStyles, calculatedModel]);

  if (!toolboxComponent)
    return <ComponentError errors={{
      hasErrors: true, componentId: actualModel.id, componentName: actualModel.componentName, componentType: actualModel.type
    }} message={`Component '${actualModel.type}' not found`} type='error'
  />;
  
  if (shaForm.formMode === 'designer') {
    const validationResult: IModelValidation = { hasErrors: false, errors: [] };
    if (actualModel?.background?.type === 'storedFile' && actualModel?.background.storedFile?.id && !isValidGuid(actualModel?.background.storedFile.id)) {
      validationResult.hasErrors = true;
      validationResult.errors.push({ propertyName: 'The provided StoredFileId is invalid', error: 'The provided StoredFileId is invalid' });
    }
    toolboxComponent?.validateModel?.(actualModel, (propertyName, error) => {
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

  if (shaForm.form.settings.isSettingsForm)
    return control;

  const attributes = {
    'data-sha-c-id': `${componentModel.id}`,
    'data-sha-c-name': `${componentModel.componentName}`,
    'data-sha-c-type': `${componentModel.type}`,
  };

  if (componentModel.type === 'subForm') {
    if ((componentModel as any)?.formSelectionMode !== 'dynamic'){
      attributes['data-sha-c-form-name'] = `${(componentModel as any)?.formId?.module}/${(componentModel as any)?.formId?.name}`;
    }
    attributes['data-sha-parent-form-id'] = `${shaForm.form.id}`;
    attributes['data-sha-parent-form-name'] = `${(shaForm as any)?.formId?.module}/${(shaForm as any)?.formId?.name}`;
  }

  return (
    <AttributeDecorator attributes={attributes}>
      {control}
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
