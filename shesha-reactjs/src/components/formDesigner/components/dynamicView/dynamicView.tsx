import React, { FC, useMemo } from 'react';
import { IConfigurableFormComponent } from '../../../../interfaces/formDesigner';
import { IPropertyMetadata } from '../../../../interfaces/metadata';
import { useForm } from '../../../../providers/form';
import { camelcaseDotNotation, createComponentModelForDataProperty, useFormDesignerComponentGroups } from '../../../../providers/form/utils';
import { useMetadata } from '../../../../providers/metadata';
import DynamicContainer from './dynamicContainer';

export interface DynamicViewProps extends IConfigurableFormComponent {

}

export const DynamicView: FC<DynamicViewProps> = (model) => {
    const currentMeta = useMetadata(false)?.metadata;

    const { allComponents, isComponentHidden } = useForm();
    const toolboxComponentGroups = useFormDesignerComponentGroups();

    const staticComponents = useMemo<IConfigurableFormComponent[]>(() => {
        const result: IConfigurableFormComponent[] = [];
        for (const componentId in allComponents) {
            if (allComponents.hasOwnProperty(componentId)) {
                result.push(allComponents[componentId]);
            }
        }
        return result;
    }, [allComponents]);

    const staticComponentBindings = useMemo(() => {
        const names = staticComponents.filter(c => Boolean(c.name)).map(component => camelcaseDotNotation(component.name));
        return names;
    }, [staticComponents]);

    const propsToRender = useMemo<IPropertyMetadata[]>(() => {
        if (!currentMeta)
            return [];
        const propertiesToMap = currentMeta.properties.filter(property => property.isVisible && !property.isFrameworkRelated && !staticComponentBindings.includes(camelcaseDotNotation(property.path)))
        return propertiesToMap;
    }, [staticComponents, currentMeta]);

    const dynamicComponents = useMemo(() => {
        const components = propsToRender.map(prop => {
            const component = createComponentModelForDataProperty(toolboxComponentGroups, prop);
            if (component)
                component.isDynamic = true;
            return component;
        }).filter(c => Boolean(c));
        return components;
    }, [propsToRender]);

    if (isComponentHidden(model)) return null;

    return (
        <DynamicContainer components={dynamicComponents} />
    );
}

export default DynamicView;