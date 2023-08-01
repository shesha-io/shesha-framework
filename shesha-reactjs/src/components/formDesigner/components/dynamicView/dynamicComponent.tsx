import React, { FC, useRef } from 'react';
import { getActualModel } from 'utils/publicUtils';
import { CustomErrorBoundary } from '../../..';
import { IConfigurableFormComponent } from '../../../../interfaces';
import { useForm } from '../../../../providers';

export interface IConfigurableFormComponentProps {
  model: IConfigurableFormComponent;
}

const DynamicComponent: FC<IConfigurableFormComponentProps> = ({ model }) => {
  const { formData, form, formMode, getToolboxComponent } = useForm();

  const componentRef = useRef();
  const toolboxComponent = getToolboxComponent(model.type);

  if (!toolboxComponent) return null;

  const actualModel = getActualModel(model, formData, formMode);

  const renderComponent = () => {
    return <CustomErrorBoundary>{toolboxComponent.factory(actualModel, componentRef, form)}</CustomErrorBoundary>;
  };

  return renderComponent();
};

export default DynamicComponent;
