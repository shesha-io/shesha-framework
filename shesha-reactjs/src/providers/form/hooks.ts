import { useMemo } from 'react';
import { useSheshaApplication } from '..';
import defaultToolboxComponents from './defaults/toolboxComponents';
import {
    IToolboxComponentGroup,
    IToolboxComponents,
} from '../../interfaces';

export const useFormDesignerComponentGroups = () => {
    const app = useSheshaApplication(false);
    const appComponentGroups = app?.toolboxComponentGroups ?? [];

    const toolboxComponentGroups = useMemo(() => {
        return [...(defaultToolboxComponents || []), ...appComponentGroups];
    }, [defaultToolboxComponents, appComponentGroups]);
    return toolboxComponentGroups;
};

export const toolbarGroupsToComponents = (availableComponents: IToolboxComponentGroup[]): IToolboxComponents => {
    const allComponents: IToolboxComponents = {};
    if (availableComponents) {
        availableComponents.forEach(group => {
            group.components.forEach(component => {
                allComponents[component.type] = component;
            });
        });
    }
    return allComponents;
};

export const useFormDesignerComponents = (): IToolboxComponents => {
    const componentGroups = useFormDesignerComponentGroups();

    const toolboxComponents = useMemo(() => toolbarGroupsToComponents(componentGroups), [componentGroups]);
    return toolboxComponents;
};