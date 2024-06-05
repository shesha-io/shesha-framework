import { useDeepCompareMemo } from '@/hooks';
import React, { FC, useRef } from 'react';
import { CustomErrorBoundary } from '@/components';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { useForm, useSheshaApplication } from '@/index';

export interface IConfigurableFormComponentProps {
  model: IConfigurableFormComponent;
}

const DynamicComponent: FC<IConfigurableFormComponentProps> = ({ model }) => {
  const allData = useAvailableConstantsData();
  const formInstance = useForm();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { form, getToolboxComponent } = formInstance;

  const componentRef = useRef();
  const toolboxComponent = getToolboxComponent(model.type);
  const parent = useParent(false);

  const actualModel: IConfigurableFormComponent = useDeepCompareMemo(() => {
    return getActualModelWithParent(
      {...model, editMode: typeof model.editMode === 'undefined' ? undefined : model.editMode}, // add editMode property if not exists
      allData, parent);
  }, [model, parent, allData.contexts.lastUpdate, allData.data, allData.globalState, allData.selectedRow]);

  if (!toolboxComponent) return null;

  // ToDo: AS review hidden and enabled for SubForm
  actualModel.hidden = allData.form?.formMode !== 'designer' 
    && (
      actualModel.hidden 
      || !anyOfPermissionsGranted(actualModel?.permissions || []));
      // || !isComponentFiltered(model)); // check `model` without modification

  actualModel.readOnly = actualModel.readOnly;// || isComponentReadOnly(model); // check `model` without modification

  const renderComponent = () => {
    return (
      <CustomErrorBoundary>
        <toolboxComponent.Factory model={actualModel} componentRef={componentRef} form={form}/>
      </CustomErrorBoundary>
    );
  };

  return renderComponent();
};

export default DynamicComponent;
