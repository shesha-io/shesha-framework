import classNames from 'classnames';
import DragWrapper from './dragWrapper';
import FormComponent from '../formComponent';
import React, {
  FC,
  MutableRefObject,
  memo,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import ValidationIcon from './validationIcon';
import { DataContextTopLevels, EditMode, IConfigurableFormComponent, useCanvas } from '@/providers';
import {
  EditOutlined,
  EyeInvisibleOutlined,
  FunctionOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { getActualPropertyValue, useAvailableConstantsData } from '@/providers/form/utils';
import { isPropertySettings } from '@/designer-components/_settings/utils';
import { Show } from '@/components/show';
import { Tooltip } from 'antd';
import { ShaForm, useIsDrawingForm } from '@/providers/form';
import { useFormDesigner, useFormDesignerReadOnly, useFormDesignerSelectedComponentId } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';
import { ComponentProperties } from '../componentPropertiesPanel/componentProperties';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { getComponentTypeInfo } from '../utils/componentTypeUtils';
import { getComponentDimensions, getDeviceDimensions, getDeviceFlexBasis } from '../utils/dimensionUtils';
import { createRootContainerStyle, createPaddingOnlyStylingBox } from '../utils/stylingUtils';
import { WRAPPER_FILL_STYLE } from '../utils/designerConstants';

export interface IConfigurableFormComponentDesignerProps {
  componentModel: IConfigurableFormComponent;
  selectedComponentId?: string;
  readOnly?: boolean;
  settingsPanelRef?: MutableRefObject<HTMLElement>;
  hidden?: boolean;
  componentEditMode?: EditMode;
}
const ConfigurableFormComponentDesignerInner: FC<IConfigurableFormComponentDesignerProps> = ({
  componentModel,
  selectedComponentId,
  readOnly,
  settingsPanelRef,
  hidden,
  componentEditMode,
}) => {
  const { styles } = useStyles();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { activeDevice } = useCanvas();

  const component = getToolboxComponent(componentModel?.type);
  const typeInfo = getComponentTypeInfo(component);
  const fullComponentModel = { ...componentModel, ...componentModel?.[activeDevice] };
  const { dimensionsStyles, stylingBoxAsCSS } = useFormComponentStyles({ ...fullComponentModel });

  const isSelected = componentModel.id && selectedComponentId === componentModel.id;
  const invalidConfiguration = componentModel.settingsValidationErrors && componentModel.settingsValidationErrors.length > 0;

  const hiddenFx = isPropertySettings(componentModel.hidden);
  const componentEditModeFx = isPropertySettings(componentModel.editMode);

  const actionText1 = (hiddenFx ? 'hidden' : '') + (hiddenFx && componentEditModeFx ? ' and ' : '') + (componentEditModeFx ? 'disabled' : '');
  const actionText2 = (hiddenFx ? 'showing' : '') + (hiddenFx && componentEditModeFx ? '/' : '') + (componentEditModeFx ? 'enabled' : '');

  const settingsEditor = useMemo(() => {
    const renderRequired = isSelected && settingsPanelRef.current;

    if (!renderRequired)
      return null;

    const result = createPortal((
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseOver={(e) => e.stopPropagation()}
        onMouseOut={(e) => e.stopPropagation()}
      >
        <ComponentProperties
          componentModel={fullComponentModel}
          readOnly={readOnly}
          toolboxComponent={getToolboxComponent(componentModel.type)}
        />
      </div>
    ), settingsPanelRef.current, "propertiesPanel");

    return result;
  }, [isSelected]);

  // Extract margins from component styling, with fallback to form defaults
  const margins = useMemo(() => ({
    marginTop: stylingBoxAsCSS?.marginTop ?? 0,
    marginBottom: stylingBoxAsCSS?.marginBottom ?? 0,
    marginLeft: stylingBoxAsCSS?.marginLeft ?? 0,
    marginRight: stylingBoxAsCSS?.marginRight ?? 0,
  }), [stylingBoxAsCSS?.marginTop, stylingBoxAsCSS?.marginBottom, stylingBoxAsCSS?.marginLeft, stylingBoxAsCSS?.marginRight]);

  // Get component dimensions (handles special cases like DataTable context)
  const componentDimensions = useMemo(() =>
    getComponentDimensions(typeInfo, dimensionsStyles),
  [typeInfo, dimensionsStyles],
  );

  // Create the model for rendering - components receive dimensions based on their config
  // and no margins (since wrapper handles margins as padding)
  const renderComponentModel = useMemo(() => {
    const deviceDimensions = getDeviceDimensions();
    // In designer mode, component only gets padding (margins go to wrapper)
    const stylingBoxWithPaddingOnly = createPaddingOnlyStylingBox(fullComponentModel.stylingBox);

    // Helper to get designer dimensions based on original config
    // - If width is 'auto' and component is button -> use 'max-content'
    // - If width is 'auto' for other components -> use '100%' (fill remaining space)
    // - Otherwise use 100% to fill the wrapper
    const getDesignerDimensions = (originalDims?: typeof fullComponentModel.dimensions): typeof deviceDimensions | undefined => {
      if (typeInfo.shouldSkip) return originalDims;

      // Check if component explicitly has auto width
      const isAutoWidth = originalDims?.width === 'auto';
      const isButton = component.type === 'button' || component.type === 'buttonGroup';

      if (isAutoWidth && isButton) {
        // Button with auto width should size to content
        return { ...deviceDimensions, width: 'max-content' as const };
      }

      // All other cases: fill the wrapper
      return deviceDimensions;
    };

    // Also remove margins and set dimensions for device-specific configs
    const desktopForDesigner = fullComponentModel.desktop
      ? {
        ...fullComponentModel.desktop,
        stylingBox: createPaddingOnlyStylingBox(fullComponentModel.desktop.stylingBox),
        dimensions: getDesignerDimensions(fullComponentModel.desktop.dimensions),
      }
      : undefined;
    const tabletForDesigner = fullComponentModel.tablet
      ? {
        ...fullComponentModel.tablet,
        stylingBox: createPaddingOnlyStylingBox(fullComponentModel.tablet.stylingBox),
        dimensions: getDesignerDimensions(fullComponentModel.tablet.dimensions),
      }
      : undefined;
    const mobileForDesigner = fullComponentModel.mobile
      ? {
        ...fullComponentModel.mobile,
        stylingBox: createPaddingOnlyStylingBox(fullComponentModel.mobile.stylingBox),
        dimensions: getDesignerDimensions(fullComponentModel.mobile.dimensions),
      }
      : undefined;

    return {
      ...fullComponentModel,
      dimensions: getDesignerDimensions(fullComponentModel.dimensions),
      stylingBox: stylingBoxWithPaddingOnly,
      desktop: desktopForDesigner,
      tablet: tabletForDesigner,
      mobile: mobileForDesigner,
      flexBasis: getDeviceFlexBasis(dimensionsStyles),
    };
  }, [fullComponentModel, activeDevice, dimensionsStyles, component.type]);

  // Create wrapper style - owns dimensions and margins
  const rootContainerStyle = useMemo(() =>
    createRootContainerStyle(componentDimensions, margins, component.isInput),
  [componentDimensions, margins, component.isInput],
  );

  return (
    <div
      style={rootContainerStyle}
      className={classNames(styles.shaComponent, {
        "selected": isSelected,
        'has-config-errors': invalidConfiguration,
      })}
    >
      <span className={styles.shaComponentIndicator}>
        <Show when={hiddenFx || componentEditModeFx}>
          <Tooltip title={`This component is ${actionText1} by condition. It's now ${actionText2} because we're in a designer mode`}>
            <FunctionOutlined />
          </Tooltip>
        </Show>

        <Show when={!hiddenFx && hidden}>
          <Tooltip title="This component is hidden. It's now showing because we're in a designer mode">
            <EyeInvisibleOutlined />
          </Tooltip>
        </Show>

        <Show when={!componentEditModeFx && (componentEditMode === 'readOnly' || componentEditMode === false)}>
          <Tooltip title="This component is always in Read only mode. It's now enabled because we're in a designer mode">
            <StopOutlined />
          </Tooltip>
        </Show>

        <Show when={!componentEditModeFx && componentEditMode === 'editable'}>
          <Tooltip title="This component is always in Edit/Action mode">
            <EditOutlined />
          </Tooltip>
        </Show>
      </span>

      {invalidConfiguration && <ValidationIcon validationErrors={componentModel.settingsValidationErrors} />}

      <div style={WRAPPER_FILL_STYLE}>
        <DragWrapper componentId={componentModel.id} readOnly={readOnly}>
          <div style={WRAPPER_FILL_STYLE}>
            <FormComponent componentModel={renderComponentModel} />
          </div>
        </DragWrapper>
      </div>
      {settingsEditor}
    </div>
  );
};

const ConfigurableFormComponentDesignerMemo = memo(ConfigurableFormComponentDesignerInner);

export const ConfigurableFormComponentDesigner: FC<IConfigurableFormComponentDesignerProps> = (props) => {
  const allData = useAvailableConstantsData({ topContextId: DataContextTopLevels.All });
  const { settingsPanelRef } = useFormDesigner();
  const selectedComponentId = useFormDesignerSelectedComponentId();
  const readOnly = useFormDesignerReadOnly();
  const hidden = getActualPropertyValue(props.componentModel, allData, 'hidden')?.hidden;
  const componentEditMode = getActualPropertyValue(props.componentModel, allData, 'editMode')?.editMode as EditMode;

  return <ConfigurableFormComponentDesignerMemo {...props} {...{ selectedComponentId, readOnly, settingsPanelRef, hidden, componentEditMode }} />;
};

export interface IConfigurableFormComponentProps {
  id: string;
  model?: IConfigurableFormComponent;
}

export const ConfigurableFormComponent: FC<IConfigurableFormComponentProps> = ({ id, model }) => {
  const isDrawing = useIsDrawingForm();

  const componentMarkupModel = ShaForm.useComponentModel(id);
  const componentModel = model?.isDynamic ? model : componentMarkupModel;

  const ComponentRenderer = !isDrawing || componentModel?.isDynamic
    ? FormComponent
    : ConfigurableFormComponentDesigner;

  return (
    <ComponentRenderer componentModel={componentModel} />
  );
};
