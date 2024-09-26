import React, { FC, MutableRefObject } from 'react';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { useForm, useSheshaApplication } from '@/providers';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { useDeepCompareMemo } from '@/hooks';
import { IModelValidation } from '@/utils/errors';
import { CustomErrorBoundary } from '..';
import ComponentError from '../componentErrors';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ componentModel, componentRef }) => {
  const formInstance = useForm();
  const allData = useAvailableConstantsData();
  const { form, isComponentFiltered } = formInstance;
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const parent = useParent(false);

  const actualModel: IConfigurableFormComponent = useDeepCompareMemo(() => {
    const result = getActualModelWithParent(
      { ...componentModel, editMode: typeof componentModel.editMode === 'undefined' ? undefined : componentModel.editMode }, // add editMode property if not exists
      allData, parent
    );

    return result;
  }, [componentModel, parent, allData.contexts.lastUpdate, allData.data, allData.globalState, allData.selectedRow]);

  const toolboxComponent = getToolboxComponent(componentModel.type);
  if (!toolboxComponent) 
    return <ComponentError errors={{
        hasErrors: true, componentId: componentModel.id, componentName: componentModel.componentName, componentType: componentModel.type
      }} message={`Component '${componentModel.type}' not found`} type='error'
    />;

  actualModel.hidden = allData.form?.formMode !== 'designer' 
    && (
      actualModel.hidden
        || !anyOfPermissionsGranted(actualModel?.permissions || [])
        || !isComponentFiltered(componentModel));
  actualModel.readOnly = actualModel.readOnly;

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

  return <toolboxComponent.Factory model={actualModel} componentRef={componentRef} form={form} />;
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
