import React, { FC, useRef } from 'react';
import { getActualModel, useApplicationContext } from 'utils/publicUtils';
import { CustomErrorBoundary } from '../../..';
import { IConfigurableFormComponent } from '../../../../interfaces';
import { useForm } from '../../../../providers';

export interface IConfigurableFormComponentProps {
  model: IConfigurableFormComponent;
}

const DynamicComponent: FC<IConfigurableFormComponentProps> = ({ model }) => {
  const { form, getToolboxComponent, isComponentHidden, isComponentDisabled } = useForm();
  const allData = useApplicationContext();

  const componentRef = useRef();
  const toolboxComponent = getToolboxComponent(model.type);

  if (!toolboxComponent) return null;

  const actualModel = getActualModel(model, allData);
  actualModel.hidden = isComponentHidden(actualModel);
  actualModel.disabled = isComponentDisabled(actualModel);
  actualModel.readOnly = actualModel.readOnly || allData.formMode === 'readonly';

  const renderComponent = () => {
    return <CustomErrorBoundary>{toolboxComponent.factory(actualModel, componentRef, form)}</CustomErrorBoundary>;
  };

  return renderComponent();
};

export default DynamicComponent;
