import { useDataContext } from 'providers/dataContextProvider';
import React, { FC, MutableRefObject } from 'react';
import { getActualModel, useApplicationContext } from 'utils/publicUtils';
import { useForm } from '../../providers/form';

export interface IFormComponentProps {
  id: string;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ id, componentRef }) => {
  const { getComponentModel, form, getToolboxComponent, isComponentHidden, isComponentDisabled } = useForm();
  const allData = useApplicationContext(useDataContext(false)?.id);

  const model = getComponentModel(id);
  const toolboxComponent = getToolboxComponent(model.type);
  if (!toolboxComponent) return <div>Component not found</div>;

  const actualModel = getActualModel(model, allData);

  actualModel.hidden = allData.formMode !== 'designer' && (actualModel.hidden || isComponentHidden(actualModel));
  actualModel.disabled = actualModel.disabled || isComponentDisabled(actualModel);
  actualModel.readOnly = actualModel.readOnly || allData.formMode === 'readonly';

  return <>{toolboxComponent.factory(actualModel, componentRef, form, null, allData)}</>;
};

export default FormComponent;
