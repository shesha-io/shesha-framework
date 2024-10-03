import React, { FC, MutableRefObject } from 'react';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { useCanvas, useForm, useSheshaApplication } from '@/providers';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { useDeepCompareMemo } from '@/hooks';
import { IModelValidation, SheshaError } from '@/utils/errors';
import { CustomErrorBoundary } from '..';
import ComponentError from '../componentErrors';
import { ErrorWrapper } from '../componentErrors/errorWrapper';

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
  const { activeDevice } = useCanvas();

  const parent = useParent(false);

  let actualModel: IConfigurableFormComponent = useDeepCompareMemo(() => {
    const result = getActualModelWithParent(
      { ...componentModel, editMode: typeof componentModel.editMode === 'undefined' ? undefined : componentModel.editMode }, // add editMode property if not exists
      allData, parent
    );

    return result;
  }, [componentModel, parent, allData.contexts.lastUpdate, allData.data, allData.globalState, allData.selectedRow]);

  const toolboxComponent = getToolboxComponent(actualModel.type);
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
      `Component '${actualModel.type}' not found`,
      {
        componentId: actualModel.id,
        componentName: actualModel.componentName,
        componentType: actualModel.type,
        model: actualModel,
      },
      'error'
    );

  actualModel.hidden = allData.form?.formMode !== 'designer' 
    && (
      actualModel.hidden
        || !anyOfPermissionsGranted(actualModel?.permissions || [])
        || !isComponentFiltered(actualModel));

  if (!toolboxComponent.isInput && !toolboxComponent.isOutput) 
    actualModel.propertyName = undefined;

  actualModel = Boolean(activeDevice) && typeof activeDevice === 'string'
      ? { ...actualModel, ...actualModel?.[activeDevice] }
      : actualModel;

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

const FormCompomnentErrorWrapper: FC<IFormComponentProps> = ({ componentModel, componentRef }) => {
  return (
    <CustomErrorBoundary 
      componentName={componentModel.componentName}
      componentType={componentModel.type}
      componentId={componentModel.id}
      model={componentModel}
    >
      <FormComponent componentModel={componentModel} componentRef={componentRef} />
    </CustomErrorBoundary>
  );
};

const FormComponentMemo = React.memo(FormCompomnentErrorWrapper);
export default FormComponentMemo;
