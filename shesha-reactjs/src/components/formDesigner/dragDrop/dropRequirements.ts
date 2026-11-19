import { IRequiredParent } from '@/interfaces/formDesigner';
import { IFlatComponentsStructure, isConfigurableFormComponent, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { COMPONENT_TYPE_ATTR } from './dragChip';

/** Returns the parent a component type needs, if it needs one. */
export type RequiredParentGetter = (type: string) => IRequiredParent | undefined;

/** Returns the requirement of `type` that none of `ancestorTypes` meets, if there is one. */
export const getUnmetRequirement = (type: string, ancestorTypes: readonly string[], getRequiredParent: RequiredParentGetter): IRequiredParent | undefined => {
  const requirement = getRequiredParent(type);
  if (!requirement) return undefined;
  return ancestorTypes.some((ancestorType) => requirement.types.includes(ancestorType)) ? undefined : requirement;
};

const TYPED_ELEMENT_SELECTOR = `[${COMPONENT_TYPE_ATTR}]`;

/** Types of the designer components that enclose `element` on the page, innermost first. */
const getDomAncestorTypes = (element: Element): string[] => {
  const result: string[] = [];
  for (let node = element.parentElement?.closest(TYPED_ELEMENT_SELECTOR); node; node = node.parentElement?.closest(TYPED_ELEMENT_SELECTOR)) {
    const type = node.getAttribute(COMPONENT_TYPE_ATTR);
    if (type) result.push(type);
  }
  return result;
};

/**
 * Checks an element being dragged at its current place on the page. SortableJS moves the dragged element into the
 * container it will be dropped into, so the components around it are the ones it would end up in. Components nested
 * inside the dragged one are checked too, e.g. a Panel holding a Data Table. Returns the message of the first
 * requirement that isn't met.
 */
export const findDomRequirementViolation = (dragged: HTMLElement, getRequiredParent: RequiredParentGetter): string | undefined => {
  const elements = [dragged, ...Array.from(dragged.querySelectorAll(TYPED_ELEMENT_SELECTOR))];
  for (const element of elements) {
    const type = element.getAttribute(COMPONENT_TYPE_ATTR);
    if (!type) continue;
    const requirement = getUnmetRequirement(type, getDomAncestorTypes(element), getRequiredParent);
    if (requirement) return requirement.message;
  }
  return undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const getRecordId = (value: unknown): string | undefined => (isRecord(value) && typeof value['id'] === 'string' ? value['id'] : undefined);

/**
 * Maps every container to the component that owns it. A component's main container has the component's own id;
 * other containers sit in a property of the component (a Panel's `header`) or in an item of an array property (a Tab,
 * a Column), or in a property of such an item (a Wizard step's `stepFooter`).
 */
const getContainerOwners = (markup: IFlatComponentsStructure): Map<string, string> => {
  const owners = new Map<string, string>();
  const claim = (containerId: string | undefined, ownerId: string): void => {
    if (containerId !== undefined && containerId !== ownerId && containerId in markup.componentRelations && !owners.has(containerId))
      owners.set(containerId, ownerId);
  };

  Object.values(markup.allComponents).forEach((component) => {
    if (!isConfigurableFormComponent(component)) return;
    Object.values(component).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          claim(getRecordId(item), component.id);
          if (isRecord(item)) Object.values(item).forEach((nested) => claim(getRecordId(nested), component.id));
        });
      } else {
        claim(getRecordId(value), component.id);
      }
    });
  });
  return owners;
};

/**
 * Finds the components whose required parent is missing in `markup`, keyed by component id, with the message to
 * show. Parents are worked out from `componentRelations`, which is always kept up to date by the designer.
 */
export const getRequirementViolations = (markup: IFlatComponentsStructure, getRequiredParent: RequiredParentGetter): Map<string, string> => {
  const result = new Map<string, string>();
  const constrained = Object.values(markup.allComponents).filter((component) =>
    isConfigurableFormComponent(component) && getRequiredParent(component.type) !== undefined);
  if (constrained.length === 0) return result;

  const containerOf = new Map<string, string>();
  Object.entries(markup.componentRelations).forEach(([containerId, childIds]) => {
    childIds?.forEach((childId) => containerOf.set(childId, containerId));
  });
  const containerOwners = getContainerOwners(markup);

  const getOwner = (containerId: string): string | undefined => {
    const component = markup.allComponents[containerId];
    return isConfigurableFormComponent(component) ? component.id : containerOwners.get(containerId);
  };

  const getAncestorTypes = (componentId: string): string[] => {
    const types: string[] = [];
    const visited = new Set<string>([componentId]);
    let containerId = containerOf.get(componentId);
    while (containerId !== undefined && containerId !== ROOT_COMPONENT_KEY) {
      const ownerId = getOwner(containerId);
      if (ownerId === undefined || visited.has(ownerId)) break;
      visited.add(ownerId);
      const owner = markup.allComponents[ownerId];
      if (isConfigurableFormComponent(owner)) types.push(owner.type);
      containerId = containerOf.get(ownerId);
    }
    return types;
  };

  constrained.forEach((component) => {
    if (!isConfigurableFormComponent(component)) return;
    const requirement = getUnmetRequirement(component.type, getAncestorTypes(component.id), getRequiredParent);
    if (requirement) result.set(component.id, requirement.message);
  });
  return result;
};

/**
 * Compares the markup before and after a change and returns the message of a requirement the change breaks. A
 * component that was already in the wrong place before (e.g. on a form saved before the requirement existed) doesn't
 * block changes, it keeps showing its own configuration error instead.
 */
export const findNewRequirementViolation = (
  before: IFlatComponentsStructure,
  after: IFlatComponentsStructure,
  getRequiredParent: RequiredParentGetter,
): string | undefined => {
  const violationsAfter = getRequirementViolations(after, getRequiredParent);
  if (violationsAfter.size === 0) return undefined;
  const violationsBefore = getRequirementViolations(before, getRequiredParent);
  for (const [componentId, message] of violationsAfter) {
    if (!violationsBefore.has(componentId)) return message;
  }
  return undefined;
};
