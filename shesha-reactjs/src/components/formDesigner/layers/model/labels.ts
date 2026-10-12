import { ReactNode } from 'react';
import { getDesignerIndicators, IDesignerIndicators } from '@/components/formDesigner/formComponent/designerIndicators';
import type { FormDesignerComponentGetter } from '@/providers/form/hooks';
import { IConfigurableFormComponent, IFlatComponentsStructure, isConfigurableFormComponent } from '@/providers/form/models';
import { getComponentContainers, IComponentContainerInfo } from '@/providers/form/utils';
import { getComponentDisplayText, getPaneLabel } from '@/providers/formDesigner/structure/displayText';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { ILayerNode } from './types';

/** The pane's settings inside its owner, e.g. the tab pane inside a Tabs component */
const findPane = (owner: IConfigurableFormComponent, paneId: string, getDefinition: FormDesignerComponentGetter): IComponentContainerInfo | undefined =>
  getComponentContainers(owner, getDefinition(owner.type)).find((container) => container.id === paneId);

/** Text shown for a row: the component's label or name, or the pane's title */
export const getLayerLabel = (node: ILayerNode, markup: IFlatComponentsStructure, getDefinition: FormDesignerComponentGetter): string => {
  if (node.kind === 'component') {
    const component = markup.allComponents[node.id];
    return isConfigurableFormComponent(component) ? getComponentDisplayText(component) : node.id;
  }
  const owner = isDefined(node.ownerId) ? markup.allComponents[node.ownerId] : undefined;
  const pane = isConfigurableFormComponent(owner) ? findPane(owner, node.id, getDefinition) : undefined;
  return isDefined(pane) ? getPaneLabel(pane) : node.id;
};

/** Grey text after the label: the property name, else the component name. Omitted when it repeats the label */
export const getLayerSecondaryText = (component: IConfigurableFormComponent, label: string): string | undefined => {
  const { propertyName, componentName } = component;
  const text = typeof propertyName === 'string' && isNotNullOrWhiteSpace(propertyName)
    ? propertyName
    : isNotNullOrWhiteSpace(componentName) ? componentName : undefined;
  return text === label ? undefined : text;
};

export interface ILayerRowView {
  label: string;
  secondaryText?: string | undefined;
  icon: ReactNode;
  indicators: IDesignerIndicators;
  isEmptyPane: boolean;
}

const NO_INDICATORS: IDesignerIndicators = { showPermissions: false, showCustomLogic: false, showHidden: false };

/** Everything a row draws. For pane rows `component` is the owner (Tabs, Wizard...) */
export const buildRowView = (node: ILayerNode, component: IConfigurableFormComponent, getDefinition: FormDesignerComponentGetter): ILayerRowView => {
  const icon = getDefinition(component.type)?.icon;
  if (node.kind === 'pane') {
    const pane = findPane(component, node.id, getDefinition);
    return { label: isDefined(pane) ? getPaneLabel(pane) : node.id, icon, indicators: NO_INDICATORS, isEmptyPane: node.childIds.length === 0 };
  }
  const label = getComponentDisplayText(component);
  return { label, secondaryText: getLayerSecondaryText(component, label), icon, indicators: getDesignerIndicators(component), isEmptyPane: false };
};
