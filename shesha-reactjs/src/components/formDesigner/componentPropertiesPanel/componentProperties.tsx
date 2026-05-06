import React, { FC, useCallback } from 'react';
import { useFormDesigner } from '@/providers/formDesigner';
import { ComponentPropertiesEditor } from './componentPropertiesEditor';
import ParentProvider from '@/providers/parentProvider/index';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { IConfigurableFormComponent, IPersistedFormProps, IToolboxComponentBase } from '@/interfaces';
import { toCamelCase } from '@/utils/string';

const getSourceFolderForComponent = (componentModel: IConfigurableFormComponent, formProps: IPersistedFormProps): string => {
  if (!componentModel || !formProps)
    return undefined;

  const componentUid = toCamelCase(componentModel.componentName, { keepLeadingSeparators: false }) || componentModel.id;
  return `/forms/${formProps.module}/${formProps.name}/${componentUid}`;
};

export interface IComponentPropertiesEditrorProps {
  componentModel: IConfigurableFormComponent;
  readOnly: boolean;
  toolboxComponent: IToolboxComponentBase;
}
export const ComponentProperties: FC<IComponentPropertiesEditrorProps> = (props) => {
  const { componentModel, readOnly, toolboxComponent } = props;
  const { id } = componentModel;
  const { updateComponent } = useFormDesigner();

  const { formProps } = useFormPersister();

  const onSave = useCallback((values) => {
    if (!readOnly)
      updateComponent({ componentId: id, updater: { ...values, id } });
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
