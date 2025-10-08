import { IComponentsContainer, IConfigurableFormComponent, IStyleType } from "@/providers";
import { ICollapsiblePanelComponentProps, isCollapsiblePanel } from "../collapsiblePanel/interfaces";
import { ISettingsInputRowProps, isSettingsInputRow } from "../settingsInputRow";
import { isPropertyRouterComponent } from "../propertyRouter";
import { isDefined } from "@/utils/nullables";

export const getHeaderStyles = (primaryColor?: string): IStyleType => (
  {
    font: {
      color: "darkslategray",
      size: 14,
      weight: "500",
      align: "left",
    },
    background: {
      type: "color",
      color: "#fff",
    },
    dimensions: {
      width: "auto",
      height: "auto",
      minHeight: "0",
      maxHeight: "auto",
      minWidth: "0",
      maxWidth: "auto",
    },
    border: {
      radiusType: "all",
      borderType: "custom",
      border: {
        all: {},
        top: {},
        right: {},
        bottom: {
          width: "2px",
          style: "solid",
          color: primaryColor || "#d9d9d9",
        },
        left: {},
      },
      radius: {
        all: '0',
      },
    },
    stylingBox: "{\"paddingLeft\":\"0\",\"paddingBottom\":\"4\",\"paddingTop\":\"4\",\"paddingRight\":\"0\"}",
  }
);

export const getBodyStyles = (): IStyleType => ({
  border: {
    radiusType: "all",
    borderType: "all",
    border: {
      all: { width: '0px', style: 'none', color: '' },
      top: {},
      right: {},
      bottom: {},
      left: {},
    },
    radius: {
      all: 0,
    },
  },
});

const isComponent = (component: unknown): component is IConfigurableFormComponent => isDefined(component) && "id" in component && "type" in component;
const isComponentsContainer = (component: IConfigurableFormComponent): component is IConfigurableFormComponent & IComponentsContainer => isComponent(component) && "components" in component && Array.isArray(component.components);

export const filterDynamicComponents = (components: IConfigurableFormComponent[], query: string, primaryColor?: string): IConfigurableFormComponent[] => {
  if (!components || !Array.isArray(components)) return [];


  const lowerCaseQuery = query.toLowerCase();

  // Helper function to evaluate hidden property
  const evaluateHidden = (hidden: boolean, directMatch: boolean, hasVisibleChildren: boolean): boolean => {
    return hidden || (!directMatch && !hasVisibleChildren);
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
      const filteredComponents = filterDynamicComponents(c.components, query, primaryColor);

      return {
        ...c,
        hidden: filteredComponents.length < 1,
        components: filteredComponents,
      };
    }

    // Handle collapsiblePanel
    if (isCollapsiblePanel(c)) {
      const contentComponents = filterDynamicComponents(c.content?.components || [], query, primaryColor);
      const hasVisibleChildren = contentComponents.length > 0;

      return {
        ...c,
        collapsible: 'header',
        content: {
          ...c.content,
          components: contentComponents,
        },
        ghost: false,
        collapsedByDefault: false,
        headerStyles: getHeaderStyles(primaryColor),
        // TODO: review and convert styles. I relized that types are incompatible after conversion to typed version
        // allStyles: getBodyStyles(),
        border: getBodyStyles().border,
        stylingBox: "{\"paddingLeft\":\"4\",\"paddingBottom\":\"4\",\"paddingTop\":\"0\",\"paddingRight\":\"4\",\"marginBottom\":\"5\"}",
        hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren),
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
      const filteredComponents = filterDynamicComponents(c.components, query, primaryColor);
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
      (isCollapsiblePanel(c) && c.content.components.length > 0) ||
      (isSettingsInputRow(c) && c.inputs.length > 0)
    );

    return !c.hidden || hasVisibleChildren;
  });
};
