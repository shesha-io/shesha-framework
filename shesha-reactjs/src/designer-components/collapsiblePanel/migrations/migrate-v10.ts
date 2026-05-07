import { SettingsMigrationContext } from "@/interfaces";
import { nanoid } from "@/utils/uuid";
import { IConfigurableFormComponent } from "@/providers/form/models";
import { IContainerComponentProps } from "@/designer-components/container/interfaces";
import { ITextComponentProps } from "@/designer-components/text/models";
import { ICollapsiblePanelComponentProps } from "../interfaces";

export const migrateV9toV10 = (prev: ICollapsiblePanelComponentProps, context: SettingsMigrationContext): ICollapsiblePanelComponentProps => {
  const model = { ...prev };
  const hasCustomHeader = model.hasCustomHeader;
  const customHeader = model.customHeader;
  const label = model.label;
  const header = model.header;
  const textContent = typeof label === 'string' ? label : undefined;


  // Skip if already migrated to the new structure
  const alreadyMigrated = header?.components?.some(
    (c: IConfigurableFormComponent) => c.type === "container" && c.componentName === "headerLayout",
  );

  if (alreadyMigrated) {
    delete model.customHeader;
    delete model.hasCustomHeader;
    return model;
  }

  // Case 1: hasCustomHeader=true -> preserve customHeader content as the header
  if (hasCustomHeader && customHeader) {
    // Remove previous header subtree from flat structure
    if (header?.id) {
      const removeSubtree = (rootId: string): void => {
        const childIds = context.flatStructure.componentRelations[rootId] ?? [];
        childIds.forEach((childId) => {
          removeSubtree(childId);
          delete context.flatStructure.allComponents[childId];
          delete context.flatStructure.componentRelations[childId];
        });
        delete context.flatStructure.allComponents[rootId];
        delete context.flatStructure.componentRelations[rootId];
      };
      removeSubtree(header.id);
    }

    model.header = customHeader;

    // Recursively register customHeader components in flat structure
    if (customHeader.components?.length > 0) {
      const registerComponents = (components: IConfigurableFormComponent[], parentId: string): void => {
        context.flatStructure.componentRelations[parentId] = components.map((c) => c.id);
        components.forEach((component) => {
          context.flatStructure.allComponents[component.id] = {
            ...context.flatStructure.allComponents[component.id],
            ...component,
            parentId,
          };
          const nested = (component as IConfigurableFormComponent & { components?: IConfigurableFormComponent[] }).components;
          if (Array.isArray(nested) && nested.length > 0) {
            registerComponents(nested, component.id);
          } else {
            context.flatStructure.componentRelations[component.id] = [];
          }
        });
      };
      registerComponents(customHeader.components, customHeader.id);
    } else {
      context.flatStructure.componentRelations[customHeader.id] = [];
    }
  } else {
  // Case 2: hasCustomHeader=false/undefined -> wrap label + existing header components in a layout
    const existingComponents = header?.components ?? [];
    const headerId = header?.id ?? nanoid();
    const headerLayoutId = nanoid();
    const labelTextId = nanoid();
    const extraAreaId = nanoid();
    const clonedComponents = existingComponents.map((c) => ({ ...c, parentId: extraAreaId }));

    const labelText = {
      id: labelTextId,
      type: "text",
      propertyName: "panelLabel",
      componentName: "panelLabel",
      labelAlign: "right",
      parentId: headerLayoutId,
      hidden: false,
      isDynamic: false,
      textType: "span",
      content: textContent,
      contentDisplay: "content",
      code: false,
      copyable: false,
      delete: false,
      ellipsis: false,
      mark: false,
      italic: false,
      underline: false,
      level: 1,
    } satisfies ITextComponentProps;

    const extraArea = {
      id: extraAreaId,
      type: "container",
      propertyName: "extraArea",
      componentName: "extraArea",
      label: "Extra Area",
      labelAlign: "right",
      parentId: headerLayoutId,
      hidden: false,
      isDynamic: false,
      direction: "horizontal",
      components: clonedComponents,
    } satisfies IContainerComponentProps;

    const headerLayout = {
      id: headerLayoutId,
      type: "container",
      propertyName: "headerLayout",
      componentName: "headerLayout",
      label: "Header Layout",
      labelAlign: "right",
      parentId: headerId,
      hidden: false,
      isDynamic: false,
      direction: "horizontal",
      justifyContent: "space-between",
      alignItems: "center",
      components: [labelText, extraArea],
    } satisfies IContainerComponentProps;

    model.header = {
      id: headerId,
      components: [headerLayout],
    };

    // Update flat structure for new components
    context.flatStructure.allComponents[labelTextId] = labelText;
    context.flatStructure.allComponents[extraAreaId] = extraArea;
    context.flatStructure.allComponents[headerLayoutId] = headerLayout;
    context.flatStructure.componentRelations[headerId] = [headerLayoutId];
    context.flatStructure.componentRelations[headerLayoutId] = [labelTextId, extraAreaId];

    // Migrate existing header components into the extra area
    if (clonedComponents.length > 0) {
      context.flatStructure.componentRelations[extraAreaId] = clonedComponents.map((c) => c.id);
      clonedComponents.forEach((c) => {
        context.flatStructure.allComponents[c.id] = c;
      });
    } else {
      context.flatStructure.componentRelations[extraAreaId] = [];
    }

    context.flatStructure.componentRelations[labelTextId] = [];
  }

  delete model.customHeader;
  delete model.hasCustomHeader;
  return model;
};
