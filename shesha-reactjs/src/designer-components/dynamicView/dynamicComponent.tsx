import { useDeepCompareMemo } from '@/hooks';
import React, { FC, useRef } from 'react';
import { CustomErrorBoundary } from '@/components';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { useForm, useSheshaApplication } from '@/index';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { IModelValidation } from '@/utils/errors';
import ComponentError from '@/components/componentErrors';

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

  if (!toolboxComponent) 
    return <ComponentError errors={{
        hasErrors: true, componentId: model.id, componentName: model.componentName, componentType: model.type
      }} message={`Component '${model.type}' not found`} type='error'
    />;

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
    const validationResult: IModelValidation = {hasErrors: false, errors: []};
    toolboxComponent.validateModel?.(actualModel, (propertyName, error) => {
      validationResult.hasErrors = true;
      validationResult.errors.push({ propertyName, error });
    });
    if (validationResult.hasErrors) {
      validationResult.componentId = model.id;
      validationResult.componentName = model.componentName;
      validationResult.componentType = model.type;
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
