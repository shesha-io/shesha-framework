import { useDeepCompareMemo } from 'hooks';
import React, { FC, MutableRefObject } from 'react';
import { getActualModel, useApplicationContext } from 'utils/publicUtils';
import { useForm } from '../../providers/form';

export interface IFormComponentProps {
  id: string;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ id, componentRef }) => {
  const { getComponentModel, form, getToolboxComponent, isComponentHidden, isComponentDisabled } = useForm();
  const allData = useApplicationContext();

  const model = getComponentModel(id);
  const actualModel = useDeepCompareMemo(() => getActualModel(model, allData),
    [model, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);

  const toolboxComponent = getToolboxComponent(model.type);
  if (!toolboxComponent) return <div>Component not found</div>;

  actualModel.hidden = isComponentHidden(actualModel);
  actualModel.disabled = isComponentDisabled(actualModel);
  actualModel.readOnly = actualModel.readOnly || allData.formMode === 'readonly';

  return <>{toolboxComponent.factory(actualModel, componentRef, form, null, allData)}</>;
};

export default FormComponent;
