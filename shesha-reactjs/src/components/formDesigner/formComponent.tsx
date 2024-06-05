import { useDeepCompareMemo } from '@/hooks';
import React, { FC, MutableRefObject } from 'react';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { useForm, useSheshaApplication } from '@/index';

export interface IFormComponentProps {
  id: string;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ id, componentRef }) => {
  const formInstance = useForm();
  const allData = useAvailableConstantsData();
  const { getComponentModel, form, getToolboxComponent, isComponentFiltered } = formInstance;
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const parent = useParent(false);

  const model = getComponentModel(id);
  const actualModel: IConfigurableFormComponent = useDeepCompareMemo(() => {
    return getActualModelWithParent(
      {...model, editMode: typeof model.editMode === 'undefined' ? undefined : model.editMode}, // add editMode property if not exists
      allData, parent);
  }, [model, parent, allData.contexts.lastUpdate, allData.data, allData.globalState, allData.selectedRow]);

  const toolboxComponent = getToolboxComponent(model.type);
  if (!toolboxComponent) return <div>Component not found</div>;

  actualModel.hidden = allData.form.formMode !== 'designer' 
    && (
        actualModel.hidden 
        || !anyOfPermissionsGranted(actualModel?.permissions || [])
        || !isComponentFiltered(model)); // check `model` without modification
  actualModel.readOnly = actualModel.readOnly;// || isComponentReadOnly(model); // check `model` without modification

  return (
    <toolboxComponent.Factory 
      model={actualModel} 
      componentRef={componentRef} 
      form={form}
    />
  );
};

export default FormComponent;
