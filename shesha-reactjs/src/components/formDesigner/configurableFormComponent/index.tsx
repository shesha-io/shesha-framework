import classNames from 'classnames';
import DragWrapper from './dragWrapper';
import FormComponent from '../formComponent';
import React, {
  FC,
  MutableRefObject,
  memo,
  useMemo,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import ValidationIcon from './validationIcon';
import { DataContextTopLevels, EditMode, IComponentModelProps, IConfigurableFormComponent, useCanvas } from '@/providers';
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
import { dimensionUtils } from '../utils/dimensionUtils';
import { stylingUtils } from '../utils/stylingUtils';
import { designerConstants } from '../utils/designerConstants';
import { jsonSafeParse } from '@/utils/object';

export interface IConfigurableFormComponentDesignerProps {
  componentModel: IComponentModelProps;
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
  const formItemRef = useRef<HTMLDivElement>(null);

  // Memoize component lookup to prevent unnecessary re-renders
  const component = useMemo(() => getToolboxComponent(componentModel?.type), [getToolboxComponent, componentModel?.type]);
  // Extract primitive values for stable dependencies - avoid object recreation triggering re-renders
  const preserveDimensionsInDesigner = useMemo(() => component?.preserveDimensionsInDesigner, [component]);

  /**
   * Merges component model with device-specific settings.
   * Handles the complexity of components with separate container configurations
   * (e.g., attachmentsEditor with thumbnail dimensions at root and container dimensions in container property).
   */
  const fullComponentModel = useMemo(() => {
    const deviceModel = componentModel?.[activeDevice];

    // Determine if component has separate container-level styling
    // This is true when both root-level and container-level dimensions exist
    const hasRootDimensions = !!(deviceModel?.dimensions || componentModel?.dimensions);
    const hasContainerDimensions = !!(deviceModel?.container?.dimensions || componentModel?.container?.dimensions);
    const hasSeparateContainerStyles = hasRootDimensions && hasContainerDimensions;

    // For backward compatibility: spread container props to root UNLESS component has explicit separate styles
    const containerPropsToSpread = hasSeparateContainerStyles
      ? {}
      : { ...componentModel?.container, ...deviceModel?.container };

    // Always merge container objects to preserve container-level configuration
    const mergedContainer = {
      ...componentModel?.container,
      ...deviceModel?.container,
    };

    return {
      ...componentModel,
      ...deviceModel,
      ...containerPropsToSpread,
      container: mergedContainer,
    };
  }, [componentModel, activeDevice]);

  /**
   * Determines which model to use for calculating wrapper styles.
   * When container has its own dimensions, those take precedence for wrapper sizing.
   */
  const styleModelForWrapper = useMemo(() => {
    const hasContainerDimensions = !!fullComponentModel.container?.dimensions;
    return hasContainerDimensions
      ? { ...fullComponentModel, ...fullComponentModel.container }
      : fullComponentModel;
  }, [fullComponentModel]);
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
    const renderRequired = isSelected && settingsPanelRef?.current;

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
    // Check if all dimensions are being preserved (true) vs partial preservation
    const preservingAllDimensions = preserveDimensionsInDesigner === true;
    if (preservingAllDimensions) {
      return { width: 'auto', height: 'auto' };
    }

    // Use dimensionUtils which handles partial preservation (array case)
    return dimensionUtils.getComponentDimensions(
      preserveDimensionsInDesigner,
      dimensionsStyles,
      jsStyle,
    );
  }, [preserveDimensionsInDesigner, dimensionsStyles, jsStyle]);

  // Create the model for rendering - components receive dimensions based on their config
  // and no margins (since wrapper handles margins directly)
  // Note: fullComponentModel already has margins stripped from style property
  const renderComponentModel = useMemo(() => {
    const deviceDimensions = dimensionUtils.getDeviceDimensions();
    // In designer mode, component only gets padding (margins go to wrapper)
    const stylingBoxWithPaddingOnly = stylingUtils.createPaddingOnlyStylingBox(fullComponentModel.stylingBox);
    const stylingBoxWithPaddingOnlyParsed = jsonSafeParse<Record<string, unknown>>(stylingBoxWithPaddingOnly, {});

    // Determine preservation mode
    const preservingAll = preserveDimensionsInDesigner === true;
    const preservingSome = Array.isArray(preserveDimensionsInDesigner) && preserveDimensionsInDesigner.length > 0;

    // Helper to get designer dimensions based on original config
    // If preserveDimensionsInDesigner is true, use original dimensions; otherwise fill wrapper
    const getDesignerDimensions = (originalDims?: typeof fullComponentModel.dimensions): typeof deviceDimensions | undefined => {
      // If all dimensions are preserved, return original
      if (preservingAll) return originalDims;

      // If component has container dimensions, preserve original thumbnail dimensions
      // The wrapper will use container dimensions instead
      if (fullComponentModel.container?.dimensions) return originalDims;

      // If component has custom dimension calculation, use it
      if (component?.getDesignerDimensions) {
        return component.getDesignerDimensions(originalDims, deviceDimensions);
      }

      // Default: fill the wrapper
      return deviceDimensions;
    };

    // Helper to get component dimensions (what the inner component receives)
    // Components always fill 100% of their wrapper in designer mode (wrapper handles sizing)
    const getComponentDimensions = (originalDims?: typeof fullComponentModel.dimensions): React.CSSProperties => {
      // If all dimensions are preserved, merge with device dimensions
      if (preservingAll) return { ...deviceDimensions, ...originalDims };

      // If component has container dimensions, preserve original thumbnail dimensions for the component
      // The wrapper will use container dimensions instead
      if (fullComponentModel.container?.dimensions) return originalDims ?? deviceDimensions;

      // For partial preservation, use the dimensionUtils to handle the logic
      if (preservingSome) {
        return dimensionUtils.getComponentDimensionsForMode(
          preserveDimensionsInDesigner,
          originalDims || {},
          true, // isDesignerMode
        );
      }

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
        // Use dimensionsStyles (includes min/max) instead of fullComponentModel.dimensions (only width/height)
        dimensionsStyles: getComponentDimensions(dimensionsStyles),
        stylingBox: stylingBoxWithPaddingOnly,
      },
    };
  }, [fullComponentModel, component, preserveDimensionsInDesigner, dimensionsStyles]);

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
      ref={formItemRef}
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
  const isEditMode = (value: unknown): value is EditMode =>
    value === 'editable' || value === 'readOnly' || value === 'inherited' || typeof value === 'boolean';

  const { hidden, componentEditMode } = useMemo(() => {
    const resolvedHidden = getActualPropertyValue(props.componentModel, allData, 'hidden')?.hidden;
    const resolvedEditMode = getActualPropertyValue(props.componentModel, allData, 'editMode')?.editMode;

    return {
      hidden: resolvedHidden,
      componentEditMode: isEditMode(resolvedEditMode) ? resolvedEditMode : undefined,
    };
  }, [props.componentModel, allData]);

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
