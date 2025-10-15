import React, { FC, useCallback } from 'react';
import { useFormDesignerActions } from '@/providers/formDesigner';
import { ComponentPropertiesEditor } from './componentPropertiesEditor';
import ParentProvider from '@/providers/parentProvider/index';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { IConfigurableFormComponent, IPersistedFormProps, IToolboxComponent } from '@/interfaces';

const getSourceFolderForComponent = (componentModel: IConfigurableFormComponent, formProps: IPersistedFormProps): string => {
  if (!componentModel || !formProps)
    return undefined;

  const componentUid = componentModel.componentName ?? componentModel.id;
  return `/forms/${formProps.module}/${formProps.name}/${componentUid}`;
};

export interface IComponentPropertiesEditrorProps {
  componentModel: IConfigurableFormComponent;
  readOnly: boolean;
  toolboxComponent: IToolboxComponent;
}
export const ComponentProperties: FC<IComponentPropertiesEditrorProps> = (props) => {
  const { componentModel, readOnly, toolboxComponent } = props;
  const { id } = componentModel;
  const { updateComponent } = useFormDesignerActions();

  const { formProps } = useFormPersister();

  const onSave = useCallback((values) => {
    if (!readOnly)
      updateComponent({ componentId: id, settings: { ...values, id } });
    return Promise.resolve();
  }, [id, readOnly, updateComponent]);

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
