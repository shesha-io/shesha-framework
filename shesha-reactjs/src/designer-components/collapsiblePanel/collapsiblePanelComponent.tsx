import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { CollapsiblePanel } from '@/components/panel';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useFormData } from '@/providers';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { GroupOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import React, { useMemo } from 'react';
import { CollapsiblePanelComponentDefinition, ICollapsiblePanelComponentProps, ICollapsiblePanelComponentPropsV0, ICollapsiblePanelContent } from './interfaces';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultHeaderStyles, defaultStyles } from './utils';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { migrateV9toV10 } from './migrations/migrate-v10';
import { isDefined } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';

const CollapsiblePanelComponent: CollapsiblePanelComponentDefinition = {
  type: 'collapsiblePanel',
  isInput: false,
  name: 'Panel',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const {
      label,
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

    const evaluatedLabel = useMemo(() => (
      typeof label === 'string' ? evaluateString(label, data) : label
    ), [label, data]);

    const headerStyles = useFormComponentStyles({ ...{ ...model.headerStyles, border: ghost ? undefined : model.headerStyles?.border } }).fullStyle;

    const isIconHidden = expandIconPosition === 'hide';

    return hidden ? null : (
      <ParentProvider model={model} name={`CollapsiblePanel-${model.id}`}>
        <CollapsiblePanel
          header={isDefined(model.header) && isNonEmptyArray(model.header.components) ? (
            <ComponentsContainer
              containerId={model.header.id}
              dynamicComponents={isDynamic ? model.header.components : []}
            />
          ) : (
            evaluatedLabel
          )}
          {...(!isIconHidden && expandIconPosition ? { expandIconPlacement: expandIconPosition } : {})}
          showArrow={collapsible !== 'disabled' && !isIconHidden}
          collapsedByDefault={collapsedByDefault}
          collapsible={collapsible === 'header' ? 'header' : 'icon'}
          ghost={ghost ?? false}
          bodyStyle={{ ...model.allStyles?.fullStyle }}
          headerStyle={{ ...headerStyles, width: '100%' }}
          className={className ?? ""}
          bodyColor={bodyColor}
          isSimpleDesign={isSimpleDesign}
          hideCollapseContent={hideCollapseContent}
          hideWhenEmpty={hideWhenEmpty}
          accentStyle={model.accentStyle}
          overflowStyle={model.allStyles?.overflowStyles}
        >
          {isDefined(content) && (
            <ComponentsContainer
              containerId={content.id}
              dynamicComponents={isDynamic ? content.components : []}
            />
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
      .add<ICollapsiblePanelComponentProps>(8, (prev) => {
        const accentStyle = prev.overflow === undefined;

        return {
          ...prev, accentStyle, desktop: { ...prev.desktop, accentStyle },
          tablet: { ...prev.tablet, accentStyle },
          mobile: { ...prev.mobile, accentStyle },
        };
      })
      .add<ICollapsiblePanelComponentProps>(9, (prev) => {
        const newModel = migratePrevStyles(prev, defaultStyles(prev));
        const defaultHeaderStyle = { ...defaultHeaderStyles(prev) };

        return {
          ...newModel, desktop: { ...newModel.desktop, overflow: prev.overflow ?? 'auto', headerStyles: defaultHeaderStyle },
          tablet: { ...newModel.tablet, overflow: prev.overflow || 'auto', headerStyles: defaultHeaderStyle },
          mobile: { ...newModel.mobile, overflow: prev.overflow || 'auto', headerStyles: defaultHeaderStyle },
        };
      })
      .add<ICollapsiblePanelComponentProps>(10, migrateV9toV10),
  customContainerNames: ['header', 'content'],
};

export default CollapsiblePanelComponent;
