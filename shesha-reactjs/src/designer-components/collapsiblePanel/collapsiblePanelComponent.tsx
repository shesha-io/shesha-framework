import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { CollapsiblePanel, headerType } from '@/components/panel';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IToolboxComponent } from '@/interfaces';
import { useFormData } from '@/providers';
import { useForm } from '@/providers/form';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { GroupOutlined } from '@ant-design/icons';
import { ExpandIconPosition } from 'antd/lib/collapse/Collapse';
import { nanoid } from '@/utils/uuid';
import React, { createContext, useContext, useMemo } from 'react';
import { ICollapsiblePanelComponentProps, ICollapsiblePanelComponentPropsV0 } from './interfaces';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultHeaderStyles, defaultStyles } from './utils';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';

type PanelContextType = 'parent' | 'child' | undefined;

const PanelContext = createContext<PanelContextType>(undefined);

const CollapsiblePanelComponent: IToolboxComponent<ICollapsiblePanelComponentProps> = {
  type: 'collapsiblePanel',
  isInput: false,
  name: 'Panel',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { formMode, formSettings } = useForm();
    const { data } = useFormData();
    const isFormSettings = formSettings?.isSettingsForm;

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

    const panelContextState = useContext(PanelContext);

    const evaluatedLabel = useMemo(() => (
      typeof label === 'string' ? evaluateString(label, data) : label
    ), [label, data]);

    const headerComponents = model?.header?.components ?? [];

    const headerStyles = useFormComponentStyles({ ...model.headerStyles, id: model.id, type: model.type }).fullStyle;

    const extra = ((headerComponents?.length > 0 || formMode === 'designer') && !hasCustomHeader) ? (
      <ComponentsContainer
        containerId={model.header?.id}
        direction="horizontal"
        dynamicComponents={isDynamic ? headerComponents : []}
      />
    ) : null;

    const panelPosition = !!panelContextState ? 'child' : 'parent';

    const headType: headerType = (() => {
      if (isFormSettings) {
        return 'default';
      } else {
        if (panelPosition === 'parent') {
          return 'parent';
        } else {
          return 'child';
        };
      };
    })();

    if (hidden) return null;

    return (
      <ParentProvider model={model}>
        <PanelContext.Provider value={panelPosition}>
          <CollapsiblePanel
            header={hasCustomHeader ? (
              <ComponentsContainer
                containerId={customHeader.id}
                dynamicComponents={isDynamic ? customHeader?.components : []}
              />
            ) : evaluatedLabel}
            expandIconPosition={expandIconPosition !== 'hide' ? (expandIconPosition as ExpandIconPosition) : 'start'}
            collapsedByDefault={collapsedByDefault}
            extra={extra}
            collapsible={collapsible === 'header' ? 'header' : 'icon'}
            showArrow={collapsible !== 'disabled' && expandIconPosition !== 'hide'}
            ghost={ghost}
            bodyStyle={model.allStyles.fullStyle}
            headerStyle={headerStyles}
            className={className}
            bodyColor={bodyColor}
            isSimpleDesign={isSimpleDesign}
            panelHeadType={headType}
            hideCollapseContent={hideCollapseContent}
            hideWhenEmpty={hideWhenEmpty}
            accentStyle={model?.accentStyle}
          >
            <ComponentsContainer
              containerId={content.id}
              dynamicComponents={isDynamic ? content.components : []}
            />
          </CollapsiblePanel>
        </PanelContext.Provider>
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
          overflow: 'auto',
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