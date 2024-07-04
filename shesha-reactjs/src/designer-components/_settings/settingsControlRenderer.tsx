import React, { FC, useRef } from 'react';
import { IConfigurableFormComponent } from '@/providers';
import { useForm } from '@/index';

interface SettingsControlRendererProps {
    id: string;
    component: IConfigurableFormComponent;
    propertyName: string;
}

export const SettingsControlRenderer: FC<SettingsControlRendererProps> = (props) => {
    const model = { ...props.component, propertyName: props.propertyName };

    const form = useForm();
    const componentRef = useRef();
    const toolboxComponent = form.getToolboxComponent(props.component.type);

    if (!toolboxComponent) return null;

    return <toolboxComponent.Factory key={model.propertyName} model={props.component} componentRef={componentRef} form={form.form} />;
};