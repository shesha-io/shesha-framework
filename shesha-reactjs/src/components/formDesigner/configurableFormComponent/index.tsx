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
import { getActualPropertyValue, getStyle, useAvailableConstantsData } from '@/providers/form/utils';
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
import { dimensionUtils } from '../utils/dimensionUtils';
import { stylingUtils } from '../utils/stylingUtils';
import { designerConstants } from '../utils/designerConstants';

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

  // Memoize component lookup to prevent unnecessary re-renders
  const component = useMemo(() => getToolboxComponent(componentModel?.type), [getToolboxComponent, componentModel?.type]);
  // Extract primitive values for stable dependencies - avoid object recreation triggering re-renders
  const { isInput: componentIsInput, preserveDimensionsInDesigner } = useMemo(() => getComponentTypeInfo(component), [component]);

  // Create model combining componentModel with device-specific settings
  // This is the base model used for both style calculations and rendering
  const fullComponentModel = useMemo(() => {
    // Check if this is a component with separate thumbnail and container dimensions
    // (e.g., attachmentsEditor has thumbnail dimensions at root and container dimensions in container)
    const deviceModel = componentModel?.[activeDevice];
    const hasRootDimensions = !!deviceModel?.dimensions || !!componentModel?.dimensions;
    const hasContainerDimensions = !!deviceModel?.container?.dimensions || !!componentModel?.container?.dimensions;
    const hasSeparateContainerStyles = hasRootDimensions && hasContainerDimensions;

    return {
      ...componentModel,
      ...deviceModel,
      // For components with separate container styles (like attachmentsEditor), don't spread container to root
      // For other components, spread container properties to root for backward compatibility
      ...(hasSeparateContainerStyles ? {} : { ...componentModel?.container, ...deviceModel?.container }),
      // Always preserve the container object for components that need it
      container: {
        ...componentModel?.container,
        ...deviceModel?.container,
      },
    };
  }, [componentModel, activeDevice]);

  // For wrapper styles: use container dimensions if available, otherwise use root level dimensions
  const styleModelForWrapper = fullComponentModel.container?.dimensions
    ? { ...fullComponentModel, ...fullComponentModel.container }
    : fullComponentModel;
  const { dimensionsStyles, stylingBoxAsCSS, jsStyle } = useFormComponentStyles(styleModelForWrapper);

  // Extract margins from ORIGINAL component styling (before stripping) for the wrapper
  // Custom style margins take precedence over stylingBox margins
  const originalJsStyle = useMemo(() => {
    return componentModel.type === 'container'
      ? getStyle(fullComponentModel?.wrapperStyle)
      : getStyle(fullComponentModel.style);
  }, [fullComponentModel, componentModel.type]);

  const isSelected = componentModel.id && selectedComponentId === componentModel.id;
  const invalidConfiguration = componentModel.settingsValidationErrors && componentModel.settingsValidationErrors.length > 0;

  const hiddenFx = isPropertySettings(componentModel.hidden);
  const componentEditModeFx = isPropertySettings(componentModel.editMode);

  const actionText1 = (hiddenFx ? 'hidden' : '') + (hiddenFx && componentEditModeFx ? ' and ' : '') + (componentEditModeFx ? 'disabled' : '');
  const actionText2 = (hiddenFx ? 'showing' : '') + (hiddenFx && componentEditModeFx ? '/' : '') + (componentEditModeFx ? 'enabled' : '');

  // Note: fullComponentModel is intentionally NOT in dependencies to prevent focus loss
  // when typing in the properties panel. The portal is created once and the component
  // receives updates through its own internal state management.
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
          toolboxComponent={component}
        />
      </div>
    ), settingsPanelRef.current, "propertiesPanel");

    return result;
  }, [isSelected, settingsPanelRef, readOnly, component]);

  // Extract margins from ORIGINAL component styling (both stylingBox and custom styles)
  // Custom style margins take precedence over stylingBox margins
  const margins = useMemo(
    () => stylingUtils.extractMargins(originalJsStyle, stylingBoxAsCSS),
    [originalJsStyle, stylingBoxAsCSS],
  );

  // Get component dimensions (handles special cases like DataTable context)
  // Memoized because getComponentDimensions creates new objects and computes flexBasis logic
  const componentDimensions = useMemo(() => {
    // For components where dimensions apply to inner elements, wrapper uses auto dimensions
    if (preserveDimensionsInDesigner) {
      return { width: 'auto', height: 'auto' };
    }
    return dimensionUtils.getComponentDimensions(
      { isInput: componentIsInput, preserveDimensionsInDesigner },
      dimensionsStyles,
      jsStyle,
    );
  }, [preserveDimensionsInDesigner, componentIsInput, dimensionsStyles, jsStyle]);

  // Create the model for rendering - components receive dimensions based on their config
  // and no margins (since wrapper handles margins directly)
  // Note: fullComponentModel already has margins stripped from style property
  const renderComponentModel = useMemo(() => {
    const deviceDimensions = dimensionUtils.getDeviceDimensions();
    // In designer mode, component only gets padding (margins go to wrapper)
    const stylingBoxWithPaddingOnly = stylingUtils.createPaddingOnlyStylingBox(fullComponentModel.stylingBox);
    let stylingBoxWithPaddingOnlyParsed = {};
    try {
      stylingBoxWithPaddingOnlyParsed = stylingBoxWithPaddingOnly ? JSON.parse(stylingBoxWithPaddingOnly) : {};
    } catch {
      console.warn('Failed to parse stylingBox:', stylingBoxWithPaddingOnly);
    }

    // Helper to get designer dimensions based on original config
    // If preserveDimensionsInDesigner is true, use original dimensions; otherwise fill wrapper
    const getDesignerDimensions = (originalDims?: typeof fullComponentModel.dimensions): typeof deviceDimensions | undefined => {
      if (preserveDimensionsInDesigner) return originalDims;

      // If component has container dimensions, preserve original thumbnail dimensions
      // The wrapper will use container dimensions instead
      if (fullComponentModel.container?.dimensions) return originalDims;

      // If component has custom dimension calculation, use it
      if (component.getDesignerDimensions) {
        return component.getDesignerDimensions(originalDims, deviceDimensions);
      }

      // Default: fill the wrapper
      return deviceDimensions;
    };

    // Helper to get component dimensions (what the inner component receives)
    // Components always fill 100% of their wrapper in designer mode (wrapper handles sizing)
    const getComponentDimensions = (originalDims?: typeof fullComponentModel.dimensions): typeof deviceDimensions => {
      if (preserveDimensionsInDesigner) return { ...deviceDimensions, ...originalDims };

      // If component has container dimensions, preserve original thumbnail dimensions for the component
      // The wrapper will use container dimensions instead
      if (fullComponentModel.container?.dimensions) return originalDims ?? deviceDimensions;

      // All components fill the wrapper in designer mode
      return deviceDimensions;
    };

    // Set dimensions for device-specific configs
    // fullComponentModel already has margins stripped from style properties
    return {
      ...fullComponentModel,
      dimensions: getDesignerDimensions(fullComponentModel.dimensions),
      stylingBox: stylingBoxWithPaddingOnly,

      allStyles: {
        ...fullComponentModel.allStyles,
        fullStyle: { ...fullComponentModel.allStyles?.fullStyle, stylingBoxAsCSS: stylingBoxWithPaddingOnlyParsed },
        ...getStyle(fullComponentModel.style),
        stylingBoxAsCSS: stylingBoxWithPaddingOnlyParsed,
        // Component dimensions: components with preserveDimensionsInDesigner get original dims, others fill wrapper
        dimensionsStyles: getComponentDimensions(fullComponentModel.dimensions),
        stylingBox: stylingBoxWithPaddingOnly,
      },
    };
  }, [fullComponentModel, component, preserveDimensionsInDesigner]);

  // Create wrapper style - owns dimensions and margins
  const rootContainerStyle = useMemo(() => {
    return stylingUtils.createRootContainerStyle(componentDimensions, margins);
  }, [componentDimensions, margins]);

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

      <div style={designerConstants.WRAPPER_FILL_STYLE}>
        <DragWrapper componentId={componentModel.id} readOnly={readOnly}>
          <div style={designerConstants.WRAPPER_FILL_STYLE}>
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

  const { hidden, componentEditMode } = useMemo(() => ({
    hidden: getActualPropertyValue(props.componentModel, allData, 'hidden')?.hidden,
    componentEditMode: getActualPropertyValue(props.componentModel, allData, 'editMode')?.editMode as EditMode,
  }), [props.componentModel, allData]);

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
