import React, { FC, MutableRefObject, useEffect, useState } from 'react';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { useForm, useSheshaApplication } from '@/providers';
import { CustomErrorBoundary } from '..';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { useDeepCompareMemo } from '@/hooks';

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

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const actualModel: IConfigurableFormComponent = useDeepCompareMemo(() => {
    const result = getActualModelWithParent(
      { ...componentModel, editMode: typeof componentModel.editMode === 'undefined' ? undefined : componentModel.editMode }, // add editMode property if not exists
      allData, parent
    );

    return result;
  }, [componentModel, parent, allData.contexts.lastUpdate, allData.data, allData.globalState, allData.selectedRow]);

  const toolboxComponent = getToolboxComponent(componentModel.type);
  if (!toolboxComponent) return <div>Component not found</div>;

  actualModel.hidden = allData.form?.formMode !== 'designer' 
    && (
      actualModel.hidden
        || !anyOfPermissionsGranted(actualModel?.permissions || [])
        || !isComponentFiltered(componentModel));
  actualModel.readOnly = actualModel.readOnly;

  if (!toolboxComponent.isInput && !toolboxComponent.isOutput) 
    actualModel.propertyName = undefined;

  const usedModel = screenWidth > 599 ? actualModel?.desktop ? { ...actualModel, ...actualModel?.desktop } : actualModel : actualModel?.mobile
  ? { actualModel, ...actualModel?.mobile } : actualModel;

  return (
    <CustomErrorBoundary>
      <toolboxComponent.Factory model={usedModel} componentRef={componentRef} form={form} />
    </CustomErrorBoundary>
  );
};

const FormComponentMemo = React.memo(FormComponent);
export default FormComponentMemo;
