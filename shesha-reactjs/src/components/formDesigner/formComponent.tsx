import React, { FC, MutableRefObject } from 'react';
import { getActualModel } from 'utils/publicUtils';
import { useForm } from '../../providers/form';

export interface IFormComponentProps {
  id: string;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ id, componentRef }) => {
  const { getComponentModel, formData, form, formMode, getToolboxComponent } = useForm();

  const model = getComponentModel(id);
  const toolboxComponent = getToolboxComponent(model.type);
  if (!toolboxComponent) return <div>Component not found</div>;

  const actualModel = getActualModel(model, formData, formMode);

  return <>{toolboxComponent.factory(actualModel, componentRef, form)}</>;
};

export default FormComponent;
