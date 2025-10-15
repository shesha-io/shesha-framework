import { IConfigurableFormComponent, SettingsMigrationContext } from '@/interfaces/formDesigner';
import { ExpandIconPosition } from 'antd/lib/collapse/Collapse';
import { CollapsibleType } from 'antd/lib/collapse/CollapsePanel';
import { nanoid } from '@/utils/uuid';
import { IChildTableComponentProps } from '../index';
import { migrateFunctionToProp } from '@/designer-components/_common-migrations/migrateSettings';
import { IFlatComponentsStructure } from '@/interfaces';

export interface IPanelContent {
  id: string;
  components?: IConfigurableFormComponent[];
}

interface CustomConfigurableFormComponent extends IConfigurableFormComponent {
  [key: string]: any; // support other custom props
}

export interface IPanelComponentProps extends IConfigurableFormComponent {
  collapsedByDefault?: boolean;
  expandIconPosition?: ExpandIconPosition | 'hide';
  header?: IPanelContent;
  content?: IPanelContent;
  collapsible?: CollapsibleType;
  ghost?: boolean;
  hideWhenEmpty?: boolean;
  className?: string;
}

const getClosestComponent = (flatStructure: IFlatComponentsStructure, id: string, predicate: (component: IConfigurableFormComponent) => boolean): IConfigurableFormComponent => {
  const current = flatStructure.allComponents[id];
  if (!current)
    return null;

  if (predicate(current))
    return current;

  return current.parentId
    ? getClosestComponent(flatStructure, current.parentId, predicate)
    : null;
};

export const migrateToTable = (
  props: IChildTableComponentProps,
  context: SettingsMigrationContext,
): IPanelComponentProps => {
  const { flatStructure } = context;

  const headerComponents: CustomConfigurableFormComponent[] = [];
  const headerId = nanoid();

  if (props.allowQuickSearch) {
    headerComponents.push({
      id: nanoid(),
      type: 'datatable.quickSearch',
      componentName: 'quickSearch',
      parentId: headerId,
      version: 1,
    });
  }
  if (props.showPagination !== false /* keep old behaviour*/) {
    headerComponents.push({
      id: nanoid(),
      type: 'datatable.pager',
      componentName: 'pager',
      parentId: headerId,
      version: 2,
    });
  }
  headerComponents.push({
    id: nanoid(),
    type: 'buttonGroup',
    componentName: 'buttons',
    parentId: headerId,
    version: 6,
    isInline: props.isInline,
    items: props.toolbarItems,
  });

  // update flat structure
  const headerComponentIds = [];
  headerComponents.forEach((component) => {
    headerComponentIds.push(component.id);
    flatStructure.allComponents[component.id] = component;
  });
  flatStructure.componentRelations[headerId] = headerComponentIds;

  const panelContent: IPanelContent = {
    id: nanoid(),
    components: [],
  };
  delete context.flatStructure.componentRelations[context.componentId];
  context.flatStructure.componentRelations[panelContent.id] = [];
  panelContent.components = props.components?.map((x) => {
    context.flatStructure.allComponents[x.id].parentId = panelContent.id;
    context.flatStructure.componentRelations[panelContent.id].push(x.id);
    return { ...x, parentId: panelContent.id };
  }) ?? [];

  const panel: IPanelComponentProps = {
    type: 'collapsiblePanel',
    version: 4,
    id: props.id,
    label: props.title,
    componentName: props.componentName,
    propertyName: props.propertyName,
    header: {
      id: headerId,
      components: headerComponents,
    },
    content: panelContent,
    customVisibility: props.customVisibility,
    className: 'no-content-padding',
  };

  const result = migrateFunctionToProp(panel, 'hidden', 'customVisibility', null, true);

  // migrate filter
  const selectedFilter = props.defaultSelectedFilterId
    ? (props.filters ?? []).find((f) => f.id === props.defaultSelectedFilterId)
    : undefined;
  if (selectedFilter && selectedFilter.expression && context.flatStructure) {
    // search closest datatable context
    const dataTableContext = getClosestComponent(context.flatStructure, props.id, (cmp) => cmp.type === 'datatableContext');
    if (dataTableContext) {
      dataTableContext['permanentFilter'] = selectedFilter.expression;
    }
  }

  return result;
};
