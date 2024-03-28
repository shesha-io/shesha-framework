import React, { FC, useMemo } from 'react';
import { useForm } from '@/providers/form';
import { Empty } from 'antd';
import { useFormDesigner } from '@/providers/formDesigner';
import { ComponentPropertiesEditor } from './componentPropertiesPanel';
import ParentProvider from '@/providers/parentProvider/index';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { IConfigurableFormComponent, IPersistedFormProps } from '@/interfaces';

export interface IProps { }

const getSourceFolderForComponent = (componentModel: IConfigurableFormComponent, formProps: IPersistedFormProps): string => {
  if (!componentModel || !formProps)
    return undefined;
  
  const componentUid = componentModel.componentName ?? componentModel.id;
  return `/forms/${formProps.module}/${formProps.name}/${componentUid}`;
};

export const ComponentPropertiesPanel: FC<IProps> = () => {
  const { getToolboxComponent } = useForm();
  const { getComponentModel, updateComponent, selectedComponentId: id, readOnly } = useFormDesigner();
  const { formProps } = useFormPersister();

  const onSave = values => {
    if (!readOnly)
      updateComponent({ componentId: id, settings: { ...values, id } });
    return Promise.resolve();
  };

  const componentModel = useMemo(() => !!id ? getComponentModel(id) : undefined, [id]);
  const toolboxComponent = useMemo(() => !!componentModel?.type ? getToolboxComponent(componentModel.type) : undefined, [componentModel?.type]);

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
  const sourcesFolder = getSourceFolderForComponent(componentModel, formProps);

  return (
    <SourceFilesFolderProvider folder={sourcesFolder}>
      <ParentProvider model={{ readOnly: readOnly }}>
        <ComponentPropertiesEditor
          key={id}
          componentModel={componentModel}
          readOnly={readOnly}
          onSave={onSave}
          autoSave={true}
          toolboxComponent={toolboxComponent}
        />
      </ParentProvider>
    </SourceFilesFolderProvider>
  );
};

export default ComponentPropertiesPanel;
