import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { CollapsiblePanel, ICollapseRef } from '@/components/panel';
import { shaHeaderComponentsContainer } from '@/components/panel/styles/styles';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { GroupOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import { useCallback, useMemo, useRef } from 'react';
import { CollapsiblePanelComponentDefinition, ICollapsiblePanelComponentProps, ICollapsiblePanelComponentPropsV0, ICollapsiblePanelContent } from './interfaces';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migrateV9toV10 } from './migrations/migrate-v10';
import { isDefined } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';
import { defaultHeaderStyles as getDefaultHeaderStyles, defaultStyles as getDefaultStyles } from './utils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { PanelApi } from '@/componentsApi/componentApi';

import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { getStyleValueFromModel } from '../_common/styles/utils';
import { IStyleValue } from '@/providers';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { EMPTY_STYLE } from '@/styles/variables';
import { useComponentApi } from '@/providers/componentApi/hooks';

const CollapsiblePanelComponent: CollapsiblePanelComponentDefinition = {
  styleGroup: 'common-containers',
  allowInherit: true,
  type: 'collapsiblePanel',
  isInput: false,
  name: 'Panel',
  icon: <GroupOutlined />,
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  Factory: ({ model: sourceModel }) => {
    const {
      expandIconPosition,
      collapsedByDefault,
      collapsible,
      isSimpleDesign,
      ghost,
      bodyColor,
      hideCollapseContent,
      hideWhenEmpty,
      isDynamic,
      content,
      className,
      hidden,
    } = sourceModel;

    const model = useMemo(() => {
      return {
        ...sourceModel,
        dimensions: { ...sourceModel.dimensions, height: '100%', width: '100%' }, // height and width will be applied to the wrapper
      };
    }, [sourceModel]);

    const collapsedRef = useRef<ICollapseRef>(undefined);
    useComponentApi<PanelApi>({ model, typeName: 'PanelApi',
      properties: [{ name: 'isExpanded', getter: () => collapsedRef.current?.collapsed !== true, setter: (value) => collapsedRef.current?.setCollapsed(!value) }],
      api: { expand: () => collapsedRef.current?.setCollapsed(false), collapse: () => collapsedRef.current?.setCollapsed(true) },
    }, [collapsedRef.current?.collapsed]);

    const handleEvent = useEvents<void>(model.componentName);

    const isIconHidden = expandIconPosition === 'hide';

    const onChange = useCallback((newValue: boolean) => handleEvent(undefined, { isExpanded: newValue }, model.onChangeCustom), [handleEvent, model.onChangeCustom]);

    return hidden === true ? null : (
      <ParentProvider model={model} name={`CollapsiblePanel-${model.id}`}>
        <CollapsiblePanel
          {...getStyleValueFromModel(model)}
          headerStyles={model.headerStyles}
          style={model.styleCss ?? EMPTY_STYLE}
          header={isDefined(model.header) && isNonEmptyArray(model.header.components) ? (
            <ComponentsContainer
              containerId={model.header.id}
              dynamicComponents={isDynamic === true ? model.header.components : []}
              className={shaHeaderComponentsContainer}
              additionalDomProperties={getComponentEvents<void>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent }, undefined, undefined, 'headerEvents')}
            />
          ) : model.label}
          {...(!isIconHidden && expandIconPosition ? { expandIconPlacement: expandIconPosition } : {})}
          showArrow={collapsible !== 'disabled' && !isIconHidden}
          collapsedByDefault={collapsedByDefault}
          collapsible={collapsible === 'header' ? 'header' : 'icon'}
          ghost={ghost ?? false}
          className={className ?? ""}
          bodyColor={bodyColor}
          isSimpleDesign={isSimpleDesign}
          hideCollapseContent={hideCollapseContent}
          hideWhenEmpty={hideWhenEmpty}
          accentStyle={model.accentStyle}
          ref={collapsedRef}
          onChange={onChange}
        >
          {isDefined(content) && (
            <ComponentsContainer
              containerId={content.id}
              dynamicComponents={isDynamic === true ? content.components : []}
              additionalDomProperties={getComponentEvents<void, ICollapsiblePanelComponentProps>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}
            />
          )}
        </CollapsiblePanel>
      </ParentProvider>
    );
  },
  settingsFormMarkup: getSettings,

  migrator: (m) =>
    m
      .add<ICollapsiblePanelComponentPropsV0>(0, (prev) => {
        return {
          ...prev,
          expandIconPosition: 'right',
        };
      })
      .add<ICollapsiblePanelComponentProps>(1, (prev, context) => {
        const header: ICollapsiblePanelContent = { id: nanoid(), components: [] };
        const content: ICollapsiblePanelContent = { id: nanoid(), components: [] };

        delete context.flatStructure.componentRelations[context.componentId];
        context.flatStructure.componentRelations[content.id] = [];
        content.components =
          (prev.components ?? []).map((x) => {
            const component = context.flatStructure.allComponents[x.id];
            if (!component)
              return undefined;

            component.parentId = content.id;
            const relation = context.flatStructure.componentRelations[content.id] ?? (context.flatStructure.componentRelations[content.id] = []);
            relation.push(x.id);
            return { ...x, parentId: content.id };
          }).filter(isDefined);

        const result: ICollapsiblePanelComponentProps & { components: undefined } = {
          ...prev,
          expandIconPosition: !prev.expandIconPosition
            ? undefined
            : prev.expandIconPosition === "left"
              ? "start"
              : "end",
          components: undefined,
          header,
          content,
          collapsible: 'icon',
          overflow: true,
        };
        return result;
      })
      .add<ICollapsiblePanelComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ICollapsiblePanelComponentProps>(3, (prev) => ({
        ...prev,
        expandIconPosition:
          (prev.expandIconPosition as string) === 'left'
            ? 'start'
            : (prev.expandIconPosition as string) === 'right'
              ? 'end'
              : undefined,
      }))
      .add<ICollapsiblePanelComponentProps>(4, (prev) => migrateVisibility(prev))
      .add<ICollapsiblePanelComponentProps>(5, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ICollapsiblePanelComponentProps>(6, (prev) => removeComponents(prev))
      .add<ICollapsiblePanelComponentProps>(7, (prev) => ({
        ...prev,
        customHeader: { id: nanoid(), components: [] },
      }))
      .add<ICollapsiblePanelComponentProps>(8, (prev, ctx) => {
        if (ctx.isNew === true) return prev;

        const accentStyle = prev.overflow === undefined;
        return {
          ...prev, accentStyle, desktop: { styleCss: {}, ...prev.desktop, accentStyle },
          tablet: { styleCss: {}, ...prev.tablet, accentStyle },
          mobile: { styleCss: {}, ...prev.mobile, accentStyle },
        };
      })
      .add<ICollapsiblePanelComponentProps>(9, (prev, ctx) => {
        if (ctx.isNew === true) return prev;

        const newModel = migratePrevStyles(prev, getDefaultStyles(prev));
        const defaultHeaderStyle = (): IStyleValue => ({ ...getDefaultHeaderStyles(prev) });
        return {
          ...newModel, desktop: { styleCss: {}, ...newModel.desktop, overflow: prev.overflow ?? 'auto', headerStyles: defaultHeaderStyle() },
          tablet: { styleCss: {}, ...newModel.tablet, overflow: prev.overflow ?? 'auto', headerStyles: defaultHeaderStyle() },
          mobile: { styleCss: {}, ...newModel.mobile, overflow: prev.overflow ?? 'auto', headerStyles: defaultHeaderStyle() },
        };
      })
      .add<ICollapsiblePanelComponentProps>(10, migrateV9toV10)
      .add<ICollapsiblePanelComponentProps>(11, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  customContainerNames: ['header', 'content'],
  getDefaultStyles: () => {
    const defaultStyles = getDefaultStyles({} as ICollapsiblePanelComponentProps);
    const defaultHeaderStyles = getDefaultHeaderStyles({} as ICollapsiblePanelComponentProps);

    return {
      ...defaultStyles,
      headerStyles: defaultHeaderStyles,
    };
  },
};

export default CollapsiblePanelComponent;
