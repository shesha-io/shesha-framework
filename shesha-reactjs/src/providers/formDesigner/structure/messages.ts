import { IFlatComponentsStructure, isConfigurableFormComponent } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';
import { getParentContainerId, IContainerOwnership } from './containers';
import { getComponentDisplayText } from './displayText';

const NOT_ON_CANVAS_MESSAGE = "This component isn't on the canvas right now, so its settings can't be shown.";

/** Explains why the selected component's settings are missing, naming the component it sits in */
export const getNotOnCanvasMessage = (markup: IFlatComponentsStructure, ownership: IContainerOwnership, componentId: string): string => {
  const containerId = getParentContainerId(markup, componentId);
  const ownerId = isDefined(containerId) ? ownership.ownerOf.get(containerId) : undefined;
  const owner = isDefined(ownerId) ? markup.allComponents[ownerId] : undefined;
  return isConfigurableFormComponent(owner)
    ? `${NOT_ON_CANVAS_MESSAGE} It's inside ${getComponentDisplayText(owner)}.`
    : NOT_ON_CANVAS_MESSAGE;
};
