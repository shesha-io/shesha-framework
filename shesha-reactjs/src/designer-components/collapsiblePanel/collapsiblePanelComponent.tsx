import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { CollapsiblePanel, headerType } from '@/components/panel';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IToolboxComponent } from '@/interfaces';
import { useFormData, useGlobalState } from '@/providers';
import { useForm } from '@/providers/form';
import { FormMarkup } from '@/providers/form/models';
import { evaluateString, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { GroupOutlined } from '@ant-design/icons';
import { ExpandIconPosition } from 'antd/lib/collapse/Collapse';
import { nanoid } from '@/utils/uuid';
import React, { createContext, useContext } from 'react';
import { ICollapsiblePanelComponentProps, ICollapsiblePanelComponentPropsV0 } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { executeFunction } from '@/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';

const settingsForm = settingsFormJson as FormMarkup;

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
    const { globalState } = useGlobalState();
    const isFormSettings = formSettings?.isSettingsForm;

    const {
      label,
      expandIconPosition,
      collapsedByDefault,
      collapsible,
      ghost,
      bodyColor,
      headerColor,
      isSimpleDesign,
      hideCollapseContent,
      hideWhenEmpty,
      accent,
    } = model;

    const panelContextState = useContext(PanelContext);

    const evaluatedLabel = typeof label === 'string' ? evaluateString(label, data) : label;

    if (model.hidden) return null;

    const styling = JSON.parse(model.stylingBox || '{}');

    const getPanelStyle = {
      ...pickStyleFromModel(styling),
      ...(executeFunction(model?.style, { data, globalState }) || {}),
    };

    const headerComponents = model?.header?.components ?? [];

    const hasCustomHeader = model?.hasCustomHeader;

    const extra =
      ((headerComponents?.length > 0 || formMode === 'designer') && !hasCustomHeader) ? (
        <ComponentsContainer
          containerId={model.header?.id}
          direction="horizontal"
          dynamicComponents={model?.isDynamic ? model.header?.components : []}
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

    return (
      <ParentProvider model={model}>
        <PanelContext.Provider value={panelPosition}>
          <CollapsiblePanel
            header={hasCustomHeader ?
              <ComponentsContainer
                containerId={model.customHeader.id}
                dynamicComponents={(model?.isDynamic) ? model?.customHeader?.components : []}
              /> :
              evaluatedLabel
            }
            expandIconPosition={expandIconPosition !== 'hide' ? (expandIconPosition as ExpandIconPosition) : 'start'}
            collapsedByDefault={collapsedByDefault}
            extra={extra}
            collapsible={collapsible === 'header' ? 'header' : 'icon'}
            showArrow={collapsible !== 'disabled' && expandIconPosition !== 'hide'}
            ghost={ghost}
            dynamicBorderRadius={model?.borderRadius}
            style={{ ...getPanelStyle }}
            className={model.className}
            bodyColor={bodyColor}
            headerColor={headerColor}
            isSimpleDesign={isSimpleDesign}
            accent={accent}
            panelHeadType={headType}
            hideCollapseContent={hideCollapseContent}
            hideWhenEmpty={hideWhenEmpty}
          >
            <ComponentsContainer
              containerId={model.content.id}
              dynamicComponents={model?.isDynamic ? model?.content.components : []}
            />
          </CollapsiblePanel>
        </PanelContext.Provider>
      </ParentProvider>
    );
  },
  initModel: (model) => ({
    ...model,
    stylingBox: "{\"marginBottom\":\"5\"}"
  }),
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
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
      .add<ICollapsiblePanelComponentProps>(8, (prev) => ({
        ...prev,
        accent: prev.accent ?? true
      }))

  ,
  customContainerNames: ['header', 'content', 'customHeader'],
};

export default CollapsiblePanelComponent;