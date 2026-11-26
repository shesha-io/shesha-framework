import { IConfigurableFormComponent, IRequiredParent } from '@/interfaces/formDesigner';
import { IFlatComponentsStructure, isConfigurableFormComponent, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { getComponentsChain } from '@/providers/form/utils';
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
 * inside the dragged one are checked too, e.g. a Panel holding a Data Table. Returns the elements whose required
 * parent isn't met, with the message to show.
 */
export const getDomRequirementViolations = (dragged: HTMLElement, getRequiredParent: RequiredParentGetter): Map<Element, string> => {
  const result = new Map<Element, string>();
  const elements = [dragged, ...Array.from(dragged.querySelectorAll(TYPED_ELEMENT_SELECTOR))];
  for (const element of elements) {
    const type = element.getAttribute(COMPONENT_TYPE_ATTR);
    if (!type) continue;
    const requirement = getUnmetRequirement(type, getDomAncestorTypes(element), getRequiredParent);
    if (requirement) result.set(element, requirement.message);
  }
  return result;
};

/** What dropping the dragged element at its current place would break. */
export interface IDomDropCheck {
  /** Why the dragged component itself can't go here: the drop is ignored. */
  error: string | undefined;
  /** Every required parent the components nested in the dragged one would miss: the drop needs confirming. */
  nestedErrors: string[];
}

/**
 * Checks dropping the dragged element at its current place, leaving out the elements in `preexisting`: ones already in
 * the wrong place when the drag started. The designer accepts those drops (see `findNewRequirementViolations`), so
 * they aren't shown as invalid either.
 */
export const checkDomDrop = (
  dragged: HTMLElement,
  getRequiredParent: RequiredParentGetter,
  preexisting: ReadonlySet<Element> = new Set(),
): IDomDropCheck => {
  const result: IDomDropCheck = { error: undefined, nestedErrors: [] };
  for (const [element, message] of getDomRequirementViolations(dragged, getRequiredParent)) {
    if (preexisting.has(element)) continue;
    if (element === dragged) result.error = message;
    else result.nestedErrors.push(message);
  }
  return result;
};

/**
 * Whether the outermost component of a chain sits on the form. Deleting a component leaves the components inside it in
 * `allComponents`, but its own entry in `parents` goes, so their chain no longer leads to the root.
 */
const isOnForm = (markup: IFlatComponentsStructure, outermost: IConfigurableFormComponent): boolean => {
  const visited = new Set<string>();
  for (let id: string | undefined = markup.parents[outermost.id]; id !== ROOT_COMPONENT_KEY; id = markup.parents[id]) {
    if (id === undefined || visited.has(id)) return false;
    visited.add(id);
  }
  return true;
};

/**
 * Returns the message of the required parent (see `IToolboxComponent.requiredParent`) the component misses in
 * `markup`, if it misses one. Components that aren't on the form any more are left out.
 */
export const getRequiredParentViolation = (
  markup: IFlatComponentsStructure,
  componentId: string,
  getRequiredParent: RequiredParentGetter,
): string | undefined => {
  const component = markup.allComponents[componentId];
  if (!isConfigurableFormComponent(component) || getRequiredParent(component.type) === undefined) return undefined;

  let chain: IConfigurableFormComponent[];
  try {
    // the outermost component first, down to the component itself
    chain = getComponentsChain(markup, componentId);
  } catch {
    // a component inside itself, already reported by getComponentsChain
    return undefined;
  }
  const outermost = chain[0];
  if (!outermost || !isOnForm(markup, outermost)) return undefined;
  const ancestorTypes = chain.slice(0, -1).map((ancestor) => ancestor.type);
  return getUnmetRequirement(component.type, ancestorTypes, getRequiredParent)?.message;
};

/** Finds the components on the form whose required parent is missing in `markup`, keyed by id, with the message to show. */
export const getRequirementViolations = (markup: IFlatComponentsStructure, getRequiredParent: RequiredParentGetter): Map<string, string> => {
  const result = new Map<string, string>();
  Object.keys(markup.allComponents).forEach((componentId) => {
    const message = getRequiredParentViolation(markup, componentId, getRequiredParent);
    if (message !== undefined) result.set(componentId, message);
  });
  return result;
};

/**
 * Compares the markup before and after a change and returns every required parent the change breaks, keyed by
 * component id. A component that was already in the wrong place before (e.g. on a form saved before the requirement
 * existed) doesn't count: it keeps showing its validation error instead.
 */
export const findNewRequirementViolations = (
  before: IFlatComponentsStructure,
  after: IFlatComponentsStructure,
  getRequiredParent: RequiredParentGetter,
): Map<string, string> => {
  const violationsAfter = getRequirementViolations(after, getRequiredParent);
  if (violationsAfter.size === 0) return violationsAfter;
  const violationsBefore = getRequirementViolations(before, getRequiredParent);
  return new Map([...violationsAfter].filter(([componentId]) => !violationsBefore.has(componentId)));
};
