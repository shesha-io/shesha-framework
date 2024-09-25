import React, { FC, MutableRefObject, useRef } from 'react';
import { IApplicationContext, getActualModelWithParent, useAvailableConstantsContexts, wrapConstantsData } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { useCanvas, useForm, useSheshaApplication } from '@/providers';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { IModelValidation } from '@/utils/errors';
import { CustomErrorBoundary } from '..';
import ComponentError from '../componentErrors';
import { TouchableProxy, makeTouchableProxy } from '@/providers/form/touchableProxy';
import { isEqual } from '@/hooks/useDeepCompareEffect';
import { TypedProxy } from '@/providers/form/observableProxy';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ componentModel, componentRef }) => {
  const formInstance = useForm();
  const { form, isComponentFiltered, formMode } = formInstance;
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { activeDevice } = useCanvas();

  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext });
  const contextProxyRef = useRef<TypedProxy<IApplicationContext>>();
  if (!contextProxyRef.current)
    contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
  else
    contextProxyRef.current.refreshAccessors(accessors);

  const proxy = contextProxyRef.current as any as TouchableProxy<IApplicationContext<any>>;
  const allData = contextProxyRef.current as any as IApplicationContext<any>;
  
  const actualModelRef = useRef<IConfigurableFormComponent>(componentModel);

  const parent = useParent(false);

  const prevModel = useRef<IConfigurableFormComponent>();

  const deviceModel = Boolean(activeDevice) && typeof activeDevice === 'string'
      ? { ...componentModel, ...componentModel?.[activeDevice] }
      : componentModel;

  if (proxy.changed || !isEqual(prevModel.current, deviceModel)) {
    console.log('calc ActualModel: ', deviceModel);

    actualModelRef.current = getActualModelWithParent(
      { ...deviceModel, editMode: typeof deviceModel.editMode === 'undefined' ? undefined : deviceModel.editMode }, // add editMode property if not exists
      allData, parent
    );
  }

  prevModel.current = {...deviceModel};

  const actualModel = actualModelRef.current;

  const toolboxComponent = getToolboxComponent(actualModel.type);
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
    const validationResult: IModelValidation = {hasErrors: false, errors: []};
    toolboxComponent.validateModel?.(actualModel, (propertyName, error) => {
      validationResult.hasErrors = true;
      validationResult.errors.push({ propertyName, error });
    });
    if (validationResult.hasErrors) {
      validationResult.componentId = actualModel.id;
      validationResult.componentName = actualModel.componentName;
      validationResult.componentType = actualModel.type;
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
