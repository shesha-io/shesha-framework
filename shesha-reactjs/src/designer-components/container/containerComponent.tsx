import { useMemo } from 'react';
import { GroupOutlined } from '@ant-design/icons';
import { IContainerComponentProps } from '@/interfaces';

import { getSettings } from './settingsForm';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { IConfigurableFormComponent } from '@/providers';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './data';
import { getStringEnumOrDefault, getStringPropertyOrUndefined } from '@/utils/object';
import { useStyles } from './styles';
import { ContainerComponentDefinition, DISPLAY_TYPES, DisplayType, FLEX_WRAPS, FlexWrap, ICommonContainerPropsV0, IContainerComponentPropsV0, IMAGE_SOURCE_TYPES, ImageSourceType, JUSTIFY_CONTENTS, JustifyContent } from './interfaces';
import { CONTAINER_DIRECTIONS, ContainerDirection } from '@/components/formDesigner/common/interfaces';
import { isDefined } from '@/utils/nullables';
import { getComponentEvents } from '../_common/events';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { useActualContextExecutionNoRefresh } from '@/hooks/formComponentHooks';
import { useCanvas } from '@/providers/canvas';
import { useIsOnCanvas } from '@/providers/canvas/onCanvas';

const ContainerComponent: ContainerComponentDefinition = {
  styleGroup: 'containers',
  allowInherit: true,
  type: 'container',
  isInput: false,
  name: 'Container',
  icon: <GroupOutlined />,
  // Static empty array to prevent unnecessary re-renders when isDynamic is false
  emptyComponents: [],
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  Factory: ({ model }) => {
    const { canvas } = useCanvas();
    // Same gate as useFormComponentStyles: a container off the canvas ignores its measurement.
    const isOnCanvas = useIsOnCanvas();
    const canvasWidth = isOnCanvas ? canvas?.width : undefined;
    const canvasHeight = isOnCanvas ? canvas?.height : undefined;
    // Stable reference: a fresh object every render defeats createStyles' reference-based memo.
    const styleModel = useMemo(
      () => ({ ...model, canvasWidth, canvasHeight }),
      [model, canvasWidth, canvasHeight],
    );
    const { styles, cx } = useStyles(styleModel);
    // use ...NoRefresh to prevent unnecessary re-renders
    const wrappedStyleJson = useActualContextExecutionNoRefresh(model.wrapperStyle, undefined, {});
    const handleEvent = useEvents<void>(model.componentName);

    return model.hidden === true ? null : (
      <ParentProvider model={model} name={`ContainerComponent-${model.id}`}>
        <ComponentsContainer
          containerId={model.id}
          wrapperStyle={wrappedStyleJson}
          style={model.styleCss}
          className={cx(model.className, styles.container)}
          dynamicComponents={model.isDynamic === true ? model.components : ContainerComponent.emptyComponents}
          additionalDomProperties={getComponentEvents<void, IContainerComponentProps>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}
        />
      </ParentProvider>
    );
  },
  settingsFormMarkup: getSettings,

  migrator: (m) => m
    .add<IContainerComponentPropsV0>(0, (prev) => ({
      ...prev,
      direction: getStringEnumOrDefault<ContainerDirection>(prev, "direction", CONTAINER_DIRECTIONS, "vertical"),
      justifyContent: getStringEnumOrDefault<JustifyContent>(prev, "justifyContent", JUSTIFY_CONTENTS, "left"),
      display: getStringEnumOrDefault<DisplayType>(prev, "display", DISPLAY_TYPES),
      flexWrap: getStringEnumOrDefault<FlexWrap>(prev, "flexWrap", FLEX_WRAPS, "wrap"),
      components: "components" in prev && isDefined(prev.components) && Array.isArray(prev.components)
        ? prev.components as IConfigurableFormComponent[]
        : [],
      editMode: 'inherited',
    } satisfies IContainerComponentPropsV0))
    .add<IContainerComponentPropsV0>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IContainerComponentPropsV0>(2, (prev) => migrateVisibility(prev))
    .add<IContainerComponentPropsV0>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<IContainerComponentPropsV0>(4, (prev, ctx) => ctx.isNew === true ? prev
      : {
        ...prev,
        backgroundDataSource: prev.backgroundDataSource ?? getStringEnumOrDefault<ImageSourceType>(prev, "dataSource", IMAGE_SOURCE_TYPES),
        backgroundBase64: prev.backgroundBase64 ?? getStringPropertyOrUndefined(prev, 'base64'),
        backgroundStoredFileId: prev.backgroundStoredFileId ?? getStringPropertyOrUndefined(prev, 'storedFileId'),
      })
    .add<IContainerComponentPropsV0>(5, (prev, ctx) => {
      if (ctx.isNew === true) return prev;
      const styles = {
        style: prev.style,
        wrapperStyle: prev.wrapperStyle,
        className: prev.className,
        stylingBox: prev.stylingBox,
        width: prev.width,
        height: prev.height,
        minWidth: prev.minWidth,
        minHeight: prev.minHeight,
        maxHeight: prev.maxHeight,
        maxWidth: prev.maxWidth,
      };
      const showAdvanced = prev.showAdvanced ?? false;
      return { ...prev, showAdvanced: showAdvanced, desktop: { ...styles, showAdvanced }, tablet: { ...styles, showAdvanced }, mobile: { ...styles, showAdvanced } };
    })
    .add<IContainerComponentPropsV0>(6, (prev, ctx) => {
      if (ctx.isNew === true) return prev;

      const flexAndGridStyles: Omit<ICommonContainerPropsV0, 'style'> = {
        display: prev.display,
        flexDirection: prev.flexDirection,
        direction: prev.direction,
        justifyContent: prev.justifyContent,
        alignItems: prev.alignItems,
        alignSelf: prev.alignSelf,
        justifySelf: prev.justifySelf,
        justifyItems: prev.justifyItems,
        textJustify: prev.textJustify,
        noDefaultStyling: prev.noDefaultStyling,
        gridColumnsCount: prev.gridColumnsCount,
        flexWrap: prev.flexWrap,
        gap: isDefined(prev.gap) ? prev.gap : 8,
        overflow: isDefined(prev.overflow) ? prev.overflow : true,
      };

      return {
        ...prev,
        desktop: { ...prev.desktop, ...flexAndGridStyles },
        tablet: { ...prev.tablet, ...flexAndGridStyles },
        mobile: { ...prev.mobile, ...flexAndGridStyles },
      };
    })
    .add<IContainerComponentProps>(7, (prev, ctx) => ctx.isNew === true ? prev : { ...prev, ...migratePrevStyles(prev, defaultStyles(prev)) })
    .add<IContainerComponentProps>(8, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
};

export const isContainerComponent = (component: IConfigurableFormComponent): component is IContainerComponentProps => component.type === ContainerComponent.type;

export default ContainerComponent;
