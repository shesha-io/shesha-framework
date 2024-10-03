import { useDeepCompareMemo } from '@/hooks';
import React, { FC, useRef } from 'react';
import { CustomErrorBoundary } from '@/components';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { useForm, useSheshaApplication } from '@/index';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { IModelValidation, SheshaError } from '@/utils/errors';
import ComponentError from '@/components/componentErrors';
import { ErrorWrapper } from '@/components/componentErrors/errorWrapper';

export interface IConfigurableFormComponentProps {
  model: IConfigurableFormComponent;
}

const DynamicComponent: FC<IConfigurableFormComponentProps> = ({ model }) => {
  const allData = useAvailableConstantsData();
  const formInstance = useForm();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { form } = formInstance;
  const getToolboxComponent = useFormDesignerComponentGetter();

  const componentRef = useRef();
  const toolboxComponent = getToolboxComponent(model.type);
  const parent = useParent(false);

  const actualModel: IConfigurableFormComponent = useDeepCompareMemo(() => {
    return getActualModelWithParent(
      { ...model, editMode: typeof model.editMode === 'undefined' ? undefined : model.editMode }, // add editMode property if not exists
      allData, parent);
  }, [model, parent, allData.contexts.lastUpdate, allData.data, allData.globalState, allData.selectedRow]);

  const validationResult: IModelValidation = {
    errors: [],
    componentId: actualModel.id,
    componentName: actualModel.componentName,
    componentType: actualModel.type,
    model: actualModel,
  };
  toolboxComponent.useValidateModel?.(
    actualModel,
    {
      addError: (propertyName: any, error: any) => {
        validationResult.errors.push({ propertyName, error, type: 'error' });
      },
      addWarning: (propertyName, error) => {
        validationResult.errors.push({ propertyName, error, type: 'warning' });
      },
    }
  );

  if (!toolboxComponent) 
    throw new SheshaError(
      `Component '${model.type}' not found`,
      {
        componentId: model.id,
        componentName: model.componentName,
        componentType: model.type,
        model: actualModel,
      },
      'error'
    );

  // TODO: AS review hidden and enabled for SubForm
  actualModel.hidden = allData.form?.formMode !== 'designer'
    && (
      actualModel.hidden
      || !anyOfPermissionsGranted(actualModel?.permissions || []));

  actualModel.readOnly = actualModel.readOnly;

  // binding only input and output components
  if (!toolboxComponent.isInput && !toolboxComponent.isOutput) 
    actualModel.propertyName = undefined;

  if (formInstance.formMode === 'designer') {
    if (validationResult.errors.length > 0) {
      if (validationResult.errors.find(x => x.type === 'error')) 
        return <ComponentError errors={validationResult} type='warning' toolboxComponent={toolboxComponent}/>;
      if (!validationResult.message)
        validationResult.message = `'${validationResult.componentType}' has configuration issue(s)`;
      return (
        <ErrorWrapper errors={validationResult}>
          <toolboxComponent.Factory model={actualModel} componentRef={componentRef} form={form} />
        </ErrorWrapper>
      );
    }
  }

  return <toolboxComponent.Factory model={actualModel} componentRef={componentRef} form={form} />;
};

const DynamicCompomnentErrorWrapper: FC<IConfigurableFormComponentProps> = (model) => {
  return (
      <CustomErrorBoundary 
        componentName={model.model.componentName}
        componentType={model.model.type}
        componentId={model.model.id}
        model={model.model}
      >
      <DynamicComponent {...model} />
    </CustomErrorBoundary>
  );
};

export default DynamicCompomnentErrorWrapper;
