import { useDeepCompareMemo } from 'hooks';
import React, { FC, useRef } from 'react';
import { getActualModel, useApplicationContext } from 'utils/publicUtils';
import { CustomErrorBoundary } from '../../..';
import { IConfigurableFormComponent } from 'interfaces';
import { useForm } from 'providers';

export interface IConfigurableFormComponentProps {
  model: IConfigurableFormComponent;
}

const DynamicComponent: FC<IConfigurableFormComponentProps> = ({ model }) => {
  const { form, getToolboxComponent, isComponentHidden, isComponentDisabled } = useForm();
  const allData = useApplicationContext();

  const componentRef = useRef();
  const toolboxComponent = getToolboxComponent(model.type);

  const actualModel = useDeepCompareMemo(() => getActualModel(model, allData),
    [model, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);

  if (!toolboxComponent) return null;

  actualModel.hidden = isComponentHidden(actualModel);
  actualModel.disabled = isComponentDisabled(actualModel);
  actualModel.readOnly = actualModel.readOnly || allData.formMode === 'readonly';

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
