import React, { FC, useMemo } from 'react';
import { useForm } from '@/providers/form';
import { useFormDesigner } from '@/providers/formDesigner';
import { ComponentPropertiesEditor } from './componentPropertiesEditor';
import ParentProvider from '@/providers/parentProvider/index';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { SourceFilesFolderProvider } from '@/providers/sourceFileManager/sourcesFolderProvider';
import { IConfigurableFormComponent, IPersistedFormProps } from '@/interfaces';

export interface IComponentPropertiesEditrorProps {

}

const getSourceFolderForComponent = (componentModel: IConfigurableFormComponent, formProps: IPersistedFormProps): string => {
    if (!componentModel || !formProps)
        return undefined;

    const componentUid = componentModel.componentName ?? componentModel.id;
    return `/forms/${formProps.module}/${formProps.name}/${componentUid}`;
};

export const ComponentProperties: FC<IComponentPropertiesEditrorProps> = () => {
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