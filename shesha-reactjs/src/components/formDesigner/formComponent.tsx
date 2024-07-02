import { useDeepCompareMemo } from '@/hooks';
import React, { FC, MutableRefObject } from 'react';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { useForm, useSheshaApplication } from '@/providers';
import { CustomErrorBoundary } from '..';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ componentModel, componentRef }) => {
  const formInstance = useForm();
  const allData = useAvailableConstantsData();
  const { form, getToolboxComponent, isComponentFiltered } = formInstance;
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
  if (!toolboxComponent) return <div>Component not found</div>;

  actualModel.hidden = allData.form?.formMode !== 'designer' 
    && (
      actualModel.hidden
        || !anyOfPermissionsGranted(actualModel?.permissions || [])
        || !isComponentFiltered(componentModel)); // check `model` without modification
  actualModel.readOnly = actualModel.readOnly;

  return (
    <CustomErrorBoundary>
      <toolboxComponent.Factory model={actualModel} componentRef={componentRef} form={form} />
    </CustomErrorBoundary>
  );
};

const FormComponentMemo = React.memo(FormComponent);
export default FormComponentMemo;