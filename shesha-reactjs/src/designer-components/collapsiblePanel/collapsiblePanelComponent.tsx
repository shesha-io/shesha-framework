import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { CollapsiblePanel, headerType } from '@/components/panel';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IToolboxComponent } from '@/interfaces';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { useForm } from '@/providers/form';
import { evaluateString, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { GroupOutlined } from '@ant-design/icons';
import { ExpandIconPosition } from 'antd/lib/collapse/Collapse';
import { nanoid } from '@/utils/uuid';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ICollapsiblePanelComponentProps, ICollapsiblePanelComponentPropsV0 } from './interfaces';
import { executeFunction } from '@/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getSettings } from './settingsForm';
import { getBackgroundImageUrl, getBackgroundStyle } from '../_settings/utils/background/utils';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';

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
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const isFormSettings = formSettings?.isSettingsForm;
    const [finalStyle, setFinalStyle] = useState<React.CSSProperties>({});
    const [headerFinalStyle, setCardFinalStyle] = useState<React.CSSProperties>({});

    const {
      label,
      expandIconPosition,
      collapsedByDefault,
      collapsible,
      ghost,
      bodyColor,
      headerColor,
      hideCollapseContent,
      hideWhenEmpty
    } = model;

    const panelContextState = useContext(PanelContext);

    const evaluatedLabel = typeof label === 'string' ? evaluateString(label, data) : label;

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingHeader = JSON.parse(model.stylingBox || '{}');

    const getBodyStyle = {
      ...pickStyleFromModel(styling),
      ...(executeFunction(model?.style, { data, globalState }) || {}),
    };

    const getHeaderStyle = {
      ...pickStyleFromModel(stylingHeader),
      ...(executeFunction(model?.style, { data, globalState }) || {}),
    };

    const dimensions = model.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;

    const dimensionsStyles = getSizeStyle(dimensions);
    const borderStyles = getBorderStyle(border, getBodyStyle);
    const fontStyles = getFontStyle(font);
    const shadowStyles = getShadowStyle(shadow);

    const headerDimensions = model?.headerStyles?.dimensions;
    const headerBorder = model?.headerStyles?.border;
    const headerFont = model?.headerStyles?.font;
    const headerShadow = model?.headerStyles?.shadow;

    const headerDimensionsStyles = getSizeStyle(headerDimensions);
    const headerBorderStyles = getBorderStyle(headerBorder, getHeaderStyle);
    const headerFontStyles = getFontStyle(headerFont);
    const headerShadowStyles = getShadowStyle(headerShadow);

    const style = {
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...shadowStyles,
      ...getBodyStyle
    };

    const headerStyle = {
      ...headerDimensionsStyles,
      ...headerBorderStyles,
      ...headerFontStyles,
      ...headerShadowStyles,
      ...getHeaderStyle
    };

    useEffect(() => {
      const fetchTabStyles = async () => {
        const background = model?.background;
        const headerBackground = model?.headerStyles?.background;

        // Fetch background style asynchronously
        const storedImageUrl = await getBackgroundImageUrl(background, backendUrl, httpHeaders);
        const headerStoredImageUrl = await getBackgroundImageUrl(headerBackground, backendUrl, httpHeaders);

        const backgroundStyle = await getBackgroundStyle(background, getBodyStyle, storedImageUrl);
        const headerBackgroundStyle = await getBackgroundStyle(headerBackground, getHeaderStyle, headerStoredImageUrl);

        setCardFinalStyle({ ...headerStyle, ...headerBackgroundStyle });
        setFinalStyle({ ...style, ...backgroundStyle });
      };

      fetchTabStyles();
    }, [model.background, model?.headerStyles?.background, backendUrl, httpHeaders]);


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

    if (model.hidden) return null;

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
            style={{ ...getBodyStyle }}
            bodyStyle={finalStyle}
            headerStyle={headerFinalStyle}
            className={model.className}
            bodyColor={bodyColor}
            headerColor={headerColor}
            isSimpleDesign={true}
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
      .add<ICollapsiblePanelComponentProps>(8, (prev) => ({ ...prev, stylingBox: "{\"marginBottom\":\"5\"}" }))
      .add<ICollapsiblePanelComponentProps>(9, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  customContainerNames: ['header', 'content', 'customHeader'],
};

export default CollapsiblePanelComponent;