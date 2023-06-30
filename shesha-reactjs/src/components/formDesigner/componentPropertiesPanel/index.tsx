import React, { FC } from 'react';
import { useForm } from 'providers/form';
import { Empty } from 'antd';
import { useFormDesigner } from 'providers/formDesigner';
import { ComponentPropertiesEditor } from './componentPropertiesPanel';

export interface IProps {}

export const ComponentPropertiesPanel: FC<IProps> = () => {
  const { getToolboxComponent } = useForm();
  const { getComponentModel, updateComponent, selectedComponentId: id, readOnly } = useFormDesigner();

  const onSave = values => {
    if (!readOnly) 
      updateComponent({ componentId: id, settings: { ...values, id } });
    return Promise.resolve();
  };

  if (!Boolean(id))
    return (
      <>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            readOnly ? 'Please select a component to view settings' : 'Please select a component to begin editing'
          }
        />
      </>
    );

  const componentModel = getComponentModel(id);
  const toolboxComponent = getToolboxComponent(componentModel.type);

  return (
    <ComponentPropertiesEditor
      key={id}
      componentModel={componentModel}
      readOnly={readOnly}
      onSave={onSave}
      autoSave={true}
      toolboxComponent={toolboxComponent}      
    />
  );
};

export default ComponentPropertiesPanel;
