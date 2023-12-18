import { useDeepCompareMemo } from '@/hooks';
import React, { FC, useRef } from 'react';
import { getActualModel, useApplicationContext } from '@/utils/publicUtils';
import { CustomErrorBoundary } from '../../..';
import { IConfigurableFormComponent } from '@/interfaces';
import { useForm } from '@/providers';

export interface IConfigurableFormComponentProps {
  model: IConfigurableFormComponent;
}

const DynamicComponent: FC<IConfigurableFormComponentProps> = ({ model }) => {
  const { form, getToolboxComponent, isComponentHidden, isComponentReadOnly } = useForm();
  const allData = useApplicationContext();

  const componentRef = useRef();
  const toolboxComponent = getToolboxComponent(model.type);

  const actualModel: IConfigurableFormComponent = useDeepCompareMemo(() => getActualModel(model, allData, false),
    [model, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);

  if (!toolboxComponent) return null;

  // ToDo: review Hidden and ReadOnly for SubForm
  actualModel.hidden = actualModel.hidden || isComponentHidden(actualModel); 
  actualModel.readOnly = actualModel.readOnly || isComponentReadOnly(actualModel);

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
