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
  const isSearching = Boolean(query);

  const matchesQuery = (text): boolean => {
    return text?.toLowerCase().includes(lowerCaseQuery);
  };

  // When searching, override hidden based on text match. When not searching, preserve the
  // original hidden value (which may be an IPropertySetting code expression) so that
  // FormComponentInner can evaluate it at render time.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolveHidden = (originalHidden: any, directMatch: boolean, hasVisibleChildren: boolean): any => {
    if (!isSearching) return originalHidden;
    return originalHidden === true || (!directMatch && !hasVisibleChildren);
  };

  const filterResult = components.map<IConfigurableFormComponent>((component) => {
    const c = { ...component };

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
      const visibleChildrenCount = contentComponents.filter((child) => !child.hidden).length;
      const hasVisibleChildren = visibleChildrenCount > 0;

      return {
        ...c,
        collapsible: 'header',
        content: {
          ...c.content,
          components: contentComponents,
        },
        hidden: resolveHidden(c.hidden, directMatch, hasVisibleChildren),
        collapsedByDefault: false,
      } satisfies ICollapsiblePanelComponentProps;
    }

    // Handle settingsInputRow
    if (isSettingsInputRow(c)) {
      const filteredInputs = c.inputs?.filter((input) => {
        const inputMatches = (
          matchesQuery(input.label) ||
          matchesQuery(input.propertyName) ||
          (input.propertyName && matchesQuery(input.propertyName.split('.').join(' ')))
        );
        return inputMatches || !isSearching;
      }).map((input) => {
        const inputMatches = (
          matchesQuery(input.label) ||
          matchesQuery(input.propertyName) ||
          (input.propertyName && matchesQuery(input.propertyName.split('.').join(' ')))
        );
        return isSearching ? { ...input, hidden: !inputMatches } : input;
      }) || [];

      const visibleInputsCount = filteredInputs.filter((input) => !input.hidden).length;

      return {
        ...c,
        inputs: filteredInputs,
        hidden: resolveHidden(c.hidden, directMatch, visibleInputsCount > 0),
      } satisfies ISettingsInputRowProps;
    }

    // Handle components with nested components
    if (isComponentsContainer(c)) {
      const filteredComponents = filterDynamicComponents(c.components, query);
      const visibleChildrenCount = filteredComponents.filter((child) => !child.hidden).length;
      const hasVisibleChildren = visibleChildrenCount > 0;

      return {
        ...c,
        components: filteredComponents,
        hidden: resolveHidden(c.hidden, directMatch, hasVisibleChildren),
      } satisfies IConfigurableFormComponent & IComponentsContainer;
    }

    // Handle basic component
    return {
      ...c,
      hidden: resolveHidden(c.hidden, directMatch, false),
    } satisfies IConfigurableFormComponent;
  });

  // Filter out null components
  return filterResult.filter((c) => {
    if (!c) return false;

    if (!isSearching) {
      // When not searching, only remove components that are explicitly hidden (boolean true).
      // IPropertySetting expressions and other values are preserved for FormComponentInner to evaluate.
      return c.hidden !== true;
    }

    // When searching, use the evaluated boolean hidden to determine visibility
    const countVisibleChildren = (children: IConfigurableFormComponent[] | undefined): number => {
      if (!children || !Array.isArray(children)) return 0;
      return children.filter((child) => !child.hidden).length;
    };

    const hasVisibleChildren = (
      (isComponentsContainer(c) && countVisibleChildren(c.components) > 0) ||
      (isCollapsiblePanel(c) && countVisibleChildren(c.content?.components) > 0) ||
      (isSettingsInputRow(c) && c.inputs && c.inputs.filter((input) => !input.hidden).length > 0)
    );

    return !c.hidden || hasVisibleChildren;
  });
};
