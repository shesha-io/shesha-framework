import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { CollapsiblePanel } from '@/components/panel';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IToolboxComponent } from '@/interfaces';
import { useFormData } from '@/providers';
import { useForm } from '@/providers/form';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { GroupOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import React, { useMemo } from 'react';
import { ICollapsiblePanelComponentProps, ICollapsiblePanelComponentPropsV0 } from './interfaces';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultHeaderStyles, defaultStyles } from './utils';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';

const CollapsiblePanelComponent: IToolboxComponent<ICollapsiblePanelComponentProps> = {
  type: 'collapsiblePanel',
  isInput: false,
  name: 'Panel',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { formMode } = useForm();
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
      hasCustomHeader,
      isDynamic,
      customHeader,
      content,
      className,
      hidden,
    } = model;


    const evaluatedLabel = useMemo(() => (
      typeof label === 'string' ? evaluateString(label, data) : label
    ), [label, data]);

    const headerComponents = model?.header?.components ?? [];

    const headerStyles = useFormComponentStyles({ ...{ ...model.headerStyles, border: ghost ? null : model.headerStyles?.border } }).fullStyle;

    const isIconHidden = expandIconPosition === 'hide';
    const extra = ((headerComponents?.length > 0 || formMode === 'designer') && !hasCustomHeader) ? (
      <ComponentsContainer
        containerId={model.header?.id}
        direction="horizontal"
        dynamicComponents={isDynamic ? headerComponents : []}
      />
    ) : null;

    return hidden ? null : (
      <ParentProvider model={model}>
        <CollapsiblePanel
          header={hasCustomHeader ? (
            <ComponentsContainer
              containerId={customHeader.id}
              dynamicComponents={isDynamic ? customHeader?.components : []}
            />
          ) : evaluatedLabel}
          expandIconPosition={isIconHidden ? undefined : expandIconPosition}
          showArrow={collapsible !== 'disabled' && !isIconHidden}
          collapsedByDefault={collapsedByDefault}
          extra={extra}
          collapsible={collapsible === 'header' ? 'header' : 'icon'}
          ghost={ghost}
          bodyStyle={model.allStyles.fullStyle}
          headerStyle={headerStyles}
          className={className}
          bodyColor={bodyColor}
          isSimpleDesign={isSimpleDesign}
          hideCollapseContent={hideCollapseContent}
          hideWhenEmpty={hideWhenEmpty}
          accentStyle={model?.accentStyle}
          overflowStyle={model.allStyles.overflowStyles}
        >
          <ComponentsContainer
            containerId={content.id}
            dynamicComponents={isDynamic ? content.components : []}
          />
        </CollapsiblePanel>
      </ParentProvider>
    );
  },
  settingsFormMarkup: () => getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
  migrator: (m) =>
    m
      .add<ICollapsiblePanelComponentPropsV0>(0, (prev) => {
        return {
          ...prev,
          expandIconPosition: 'right',
        };
      })
      .add<ICollapsiblePanelComponentProps>(1, (prev, context) => {
        const header = { id: nanoid(), components: [] };
        const content = { id: nanoid(), components: [] };

        delete context.flatStructure.componentRelations[context.componentId];
        context.flatStructure.componentRelations[content.id] = [];
        content.components =
          prev.components?.map((x) => {
            context.flatStructure.allComponents[x.id].parentId = content.id;
            context.flatStructure.componentRelations[content.id].push(x.id);
            return { ...x, parentId: content.id };
          }) ?? [];

        return {
          ...prev,
          components: undefined,
          header,
          content,
          collapsible: 'icon',
          overflow: true,
        };
      })
      .add<ICollapsiblePanelComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ICollapsiblePanelComponentProps>(3, (prev) => ({
        ...prev,
        expandIconPosition:
          prev.expandIconPosition === 'left'
            ? 'start'
            : prev.expandIconPosition === 'right'
              ? 'end'
              : prev.expandIconPosition,
      }))
      .add<ICollapsiblePanelComponentProps>(4, (prev) => migrateVisibility(prev))
      .add<ICollapsiblePanelComponentProps>(5, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ICollapsiblePanelComponentProps>(6, (prev) => removeComponents(prev))
      .add<ICollapsiblePanelComponentProps>(7, (prev) => ({
        ...prev,
        customHeader: { id: nanoid(), components: [] }
      }))
      .add<ICollapsiblePanelComponentProps>(8, (prev) => {
        const accentStyle = prev?.overflow === undefined;

        return {
          ...prev, accentStyle, desktop: { ...prev.desktop, accentStyle },
          tablet: { ...prev.tablet, accentStyle },
          mobile: { ...prev.mobile, accentStyle }
        };
      })
      .add<ICollapsiblePanelComponentProps>(9, (prev) => {
        const newModel = migratePrevStyles(prev, defaultStyles(prev));
        const defaultHeaderStyle = { ...defaultHeaderStyles(prev) };

        return {
          ...newModel, desktop: { ...newModel.desktop, overflow: prev.overflow ?? 'auto', headerStyles: defaultHeaderStyle },
          tablet: { ...newModel.tablet, overflow: prev.overflow || 'auto', headerStyles: defaultHeaderStyle },
          mobile: { ...newModel.mobile, overflow: prev.overflow || 'auto', headerStyles: defaultHeaderStyle }
        };
      }),
  customContainerNames: ['header', 'content', 'customHeader'],
};

export default CollapsiblePanelComponent;