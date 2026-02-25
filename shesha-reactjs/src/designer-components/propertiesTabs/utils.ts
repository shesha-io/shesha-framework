import { IComponentsContainer, IConfigurableFormComponent } from "@/providers";
import { ICollapsiblePanelComponentProps, isCollapsiblePanel } from "../collapsiblePanel/interfaces";
import { isSettingsInputRow } from "../settingsInputRow";
import { isPropertyRouterComponent } from "../propertyRouter";
import { isDefined } from "@/utils/nullables";
import { ISettingsInputRowProps } from "../settingsInputRow/interfaces";

const isComponent = (component: unknown): component is IConfigurableFormComponent => isDefined(component) && "id" in component && "type" in component;
const isComponentsContainer = (component: IConfigurableFormComponent): component is IConfigurableFormComponent & IComponentsContainer => isComponent(component) && "components" in component && Array.isArray(component.components);

export const filterDynamicComponents = (components: IConfigurableFormComponent[], query: string): IConfigurableFormComponent[] => {
  if (!components || !Array.isArray(components)) return [];


  const lowerCaseQuery = query.toLowerCase();

  // Helper function to evaluate hidden property
  const evaluateHidden = (hidden: boolean, directMatch: boolean, hasVisibleChildren: boolean): boolean => {
    return hidden === true || (!directMatch && !hasVisibleChildren);
  };

  // Helper function to check if text
  // matches query

  const matchesQuery = (text): boolean => {
    return text?.toLowerCase().includes(lowerCaseQuery);
  };

  const filterResult = components.map<IConfigurableFormComponent>((component) => {
    // Deep clone the component to avoid mutations
    const c = { ...component };

    // Check if component matches query directly
    const directMatch = (
      matchesQuery(c.label) ||
      matchesQuery(c.propertyName) ||
      (c.propertyName && matchesQuery(c.propertyName.split('.').join(' ')))
    );

    // Handle propertyRouter
    if (isPropertyRouterComponent(c)) {
      const filteredComponents = filterDynamicComponents(c.components, query);

      return {
        ...c,
        hidden: filteredComponents.length < 1,
        components: filteredComponents,
      };
    }

    // Handle collapsiblePanel
    if (isCollapsiblePanel(c)) {
      const contentComponents = filterDynamicComponents(c.content?.components || [], query);
      const hasVisibleChildren = contentComponents.length > 0;

      return {
        ...c,
        collapsible: 'header',
        content: {
          ...c.content,
          components: contentComponents,
        },
        hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren),
        collapsedByDefault: false,
      } satisfies ICollapsiblePanelComponentProps;
    }

    // Handle settingsInputRow
    if (isSettingsInputRow(c)) {
      const filteredInputs = c.inputs?.filter((input) =>
        matchesQuery(input.label) ||
        matchesQuery(input.propertyName) ||
        (input.propertyName && matchesQuery(input.propertyName.split('.').join(' '))),
      ) || [];

      return {
        ...c,
        inputs: filteredInputs,
        hidden: evaluateHidden(c.hidden, directMatch, filteredInputs.length > 0),
      } satisfies ISettingsInputRowProps;
    }

    // Handle components with nested components
    if (isComponentsContainer(c)) {
      const filteredComponents = filterDynamicComponents(c.components, query);
      const hasVisibleChildren = filteredComponents.length > 0;

      return {
        ...c,
        components: filteredComponents,
        hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren),
      } satisfies IConfigurableFormComponent & IComponentsContainer;
    }

    // Handle basic component
    return {
      ...c,
      hidden: evaluateHidden(c.hidden, directMatch, false),
    } satisfies IConfigurableFormComponent;
  });

  // Filter out null components and handle visibility
  return filterResult.filter((c) => {
    if (!c) return false;

    // Evaluate final hidden state
    const hasVisibleChildren = (
      (isComponentsContainer(c) && c.components.length > 0) ||
      (isCollapsiblePanel(c) && c.content?.components?.length > 0) ||
      (isSettingsInputRow(c) && c.inputs?.length > 0)
    );

    return !c.hidden || hasVisibleChildren;
  });
};
