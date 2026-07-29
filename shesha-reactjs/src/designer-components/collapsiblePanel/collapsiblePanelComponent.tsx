import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { CollapsiblePanel, ICollapseRef } from '@/components/panel';
import { shaHeaderComponentsContainer } from '@/components/panel/styles/styles';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { GroupOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { PanelApi } from '@/componentsApi/componentApi';

import apiCode from "../../componentsApi/componentApi.ts?raw";
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { getStyleValueFromModel } from '../_common/styles/utils';

const CollapsiblePanelComponent: CollapsiblePanelComponentDefinition = {
  allowInherit: true,
  type: 'collapsiblePanel',
  isInput: false,
  name: 'Panel',
  icon: <GroupOutlined />,
  useCalculateModel(model, allData) {
    const evaluatedLabel = typeof model.label === 'string' ? evaluateString(model.label, { data: allData.data }) : model.label;
    const calcModel = useMemo(() => ({ evaluatedLabel }), [evaluatedLabel]);
    return calcModel;
  },
  Factory: ({ model, calculatedModel }) => {
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
    } = model;

    const collapsedRef = useRef<ICollapseRef>(undefined);
    const componentApi = useComponentApi();
    useEffect(() => {
      componentApi?.updateApi<PanelApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'PanelApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [{ name: 'isExpanded', getter: () => collapsedRef.current?.collapsed !== true, setter: (value) => collapsedRef.current?.setCollapsed(!value) }],
        api: { expand: () => collapsedRef.current?.setCollapsed(false), collapse: () => collapsedRef.current?.setCollapsed(true) },
      });
    }, [componentApi, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));
    const handleEvent = useEvents<void>(model.componentName);

    const isIconHidden = expandIconPosition === 'hide';

    const onChange = useCallback((newValue: boolean) => handleEvent(undefined, { isExpanded: newValue }, model.onChangeCustom), [handleEvent, model.onChangeCustom]);

    return hidden === true ? null : (
      <ParentProvider model={model} name={`CollapsiblePanel-${model.id}`}>
        <CollapsiblePanel
          {...getStyleValueFromModel(model)}
          style={model.styleJson ?? {}}
          header={isDefined(model.header) && isNonEmptyArray(model.header.components) ? (
            <div {...getComponentEvents<void>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent }, undefined, undefined, 'headerEvents')}>
              <ComponentsContainer
                containerId={model.header.id}
                dynamicComponents={isDynamic === true ? model.header.components : []}
                className={shaHeaderComponentsContainer}
              />
            </div>
          ) : calculatedModel.evaluatedLabel}
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
            <div {...getComponentEvents<void, ICollapsiblePanelComponentProps>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}>
              <ComponentsContainer
                containerId={content.id}
                dynamicComponents={isDynamic === true ? content.components : []}
              />
            </div>
          )}
        </CollapsiblePanel>
      </ParentProvider>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
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
          ...prev, accentStyle, desktop: { ...prev.desktop, accentStyle },
          tablet: { ...prev.tablet, accentStyle },
          mobile: { ...prev.mobile, accentStyle },
        };
      })
      .add<ICollapsiblePanelComponentProps>(9, (prev, ctx) => {
        if (ctx.isNew === true) return prev;

        const newModel = migratePrevStyles(prev, getDefaultStyles(prev));
        const defaultHeaderStyle = { ...getDefaultHeaderStyles(prev) };
        return {
          ...newModel, desktop: { ...newModel.desktop, overflow: prev.overflow ?? 'auto', headerStyles: defaultHeaderStyle },
          tablet: { ...newModel.tablet, overflow: prev.overflow ?? 'auto', headerStyles: defaultHeaderStyle },
          mobile: { ...newModel.mobile, overflow: prev.overflow ?? 'auto', headerStyles: defaultHeaderStyle },
        };
      })
      .add<ICollapsiblePanelComponentProps>(10, migrateV9toV10)
      .add<ICollapsiblePanelComponentProps>(11, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev))),
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
