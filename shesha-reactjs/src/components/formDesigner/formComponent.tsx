import { useDeepCompareMemo } from '@/hooks';
import React, { FC, MutableRefObject } from 'react';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableFormComponent } from '@/interfaces';
import { useParent } from '@/providers/parentProvider/index';
import { useSheshaApplication } from '@/providers';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ componentModel, componentRef }) => {
  const allData = useAvailableConstantsData();
  const { form, getToolboxComponent, isComponentFiltered } = allData.form;
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

  actualModel.hidden = allData.formMode !== 'designer'
    && (
      actualModel.hidden
      || !anyOfPermissionsGranted(componentModel?.permissions || [])
      || !isComponentFiltered(componentModel)); // check `model` without modification
  actualModel.readOnly = actualModel.readOnly;// || isComponentReadOnly(model); // check `model` without modification

  return (
    <toolboxComponent.Factory
      model={actualModel}
      componentRef={componentRef}
      form={form}
    />
  );
};

const FormComponentMemo = React.memo(FormComponent);
export default FormComponentMemo;