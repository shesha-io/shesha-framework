import React, { FC, useMemo } from 'react';
import { CustomErrorBoundary } from '@/components/customErrorBoundary';
import { IConfigurableFormComponent, UnwrapCodeEvaluators } from '@/interfaces';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { formComponentActualModelPropertyFilter, isFormFullName } from '@/providers/form/utils';
import { IModelValidation, throwError } from '@/utils/errors';
import ErrorIconPopover from '@/components/componentErrors/errorIconPopover';
import AttributeDecorator from '@/components/attributeDecorator';
import { useShaFormDataUpdate, useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { useSheshaApplication } from '@/providers/sheshaApplication';
import { useCanvas } from '@/providers/canvas';
import { useActualContextData, useActualContextExecution, useCalculatedModel } from '@/hooks/formComponentHooks';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { isSubFormComponent } from '../subForm';
import { getDeviceModel } from '@/utils/form';

export interface IConfigurableFormComponentProps {
  model: IConfigurableFormComponent;
}

type CustomHtmlAttributes = {
  "data-sha-c-id"?: string | undefined;
  "data-sha-c-name"?: string | undefined;
  "data-sha-c-type"?: string | undefined;
  "data-sha-c-form-name"?: string | undefined;
  "data-sha-parent-form-id"?: string | undefined;
  "data-sha-parent-form-name"?: string | undefined;
};


const DynamicComponent: FC<IConfigurableFormComponentProps> = ({ model: componentModel }) => {
  useShaFormDataUpdate();

  const shaApplication = useSheshaApplication();
  const shaForm = useShaFormInstance();
  // const { isComponentFiltered } = useForm();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { activeDevice } = useCanvas();

  const toolboxComponent = getToolboxComponent(componentModel.type) ?? throwError(`Cannot find toolbox component for type ${componentModel.type}`);
  const { Factory } = toolboxComponent;

  const activeDeviceModel = getDeviceModel(componentModel, activeDevice);
  const deviceModel = activeDeviceModel && typeof (activeDeviceModel) === 'object'
    ? { ...componentModel, ...activeDeviceModel }
    : componentModel;

  const actualModel: UnwrapCodeEvaluators<IConfigurableFormComponent> = useActualContextData(
    deviceModel,
    undefined,
    undefined,
    (name: string, value: unknown) => formComponentActualModelPropertyFilter(toolboxComponent, name, value),
    undefined,
  );

  // TODO: AS review hidden and enabled for SubForm
  actualModel.hidden = shaForm.formMode !== 'designer' &&
    (
      actualModel.hidden ||
      !anyOfPermissionsGranted(actualModel.permissions || []));

  // binding only input and output components
  if (!toolboxComponent.isInput && !toolboxComponent.isOutput)
    actualModel.propertyName = undefined;

  actualModel.jsStyle = useActualContextExecution(actualModel.style, undefined, {}); // use default style if empty or error

  const calculatedModel = useCalculatedModel(actualModel, toolboxComponent.calculateModel);

  const control = useMemo(() => (
    <Factory
      form={shaForm.antdForm}
      model={actualModel}
      calculatedModel={calculatedModel}
      shaApplication={shaApplication}
      key={actualModel.id}
    />
  ), [actualModel, calculatedModel, shaForm.antdForm, shaApplication, Factory]);

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

  const attributes: CustomHtmlAttributes = {
    'data-sha-c-id': `${componentModel.id}`,
    'data-sha-c-name': `${componentModel.componentName}`,
    'data-sha-c-type': `${componentModel.type}`,
  };

  if (isSubFormComponent(componentModel)) {
    if (isFormFullName(componentModel.formId))
      attributes['data-sha-c-form-name'] = `${componentModel.formId.module}/${componentModel.formId.name}`;
    if (!isNullOrWhiteSpace(shaForm.form?.id))
      attributes['data-sha-parent-form-id'] = `${shaForm.form.id}`;
    if (isFormFullName(shaForm.formId))
      attributes['data-sha-parent-form-name'] = `${shaForm.formId.module}/${shaForm.formId.name}`;
  }

  // Wrap component with error icon if there are validation errors
  const wrappedControl = validationResult ? (
    <ErrorIconPopover mode="validation" validationResult={validationResult} type="warning" isDesignerMode={shaForm.formMode === 'designer'}>
      {control}
    </ErrorIconPopover>
  ) : control;

  return (
    <CustomErrorBoundary>
      <AttributeDecorator attributes={attributes as Record<string, string>}>
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
