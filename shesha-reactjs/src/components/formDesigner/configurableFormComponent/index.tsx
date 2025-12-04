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
import { addPx } from '@/utils/style';

// Module-level style constants to prevent recreation on every render
const fullSizeBoxStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box'
};

const paddedBoxStyle: React.CSSProperties = {
  padding: '5px 3px',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%'
};

const isValidDeviceKey = (device: unknown): device is 'desktop' | 'tablet' | 'mobile' => {
  return typeof device === 'string' && ['desktop', 'tablet', 'mobile'].includes(device);
};

export interface IConfigurableFormComponentDesignerProps {
  componentModel: IConfigurableFormComponent;
  selectedComponentId?: string;
  readOnly?: boolean;
  settingsPanelRef?: MutableRefObject<any>;
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

  const isSelected = componentModel.id && selectedComponentId === componentModel.id;

  const invalidConfiguration = componentModel.settingsValidationErrors && componentModel.settingsValidationErrors.length > 0;

  const hiddenFx = isPropertySettings(componentModel.hidden);
  const componentEditModeFx = isPropertySettings(componentModel.editMode);

  const actionText1 = (hiddenFx ? 'hidden' : '') + (hiddenFx && componentEditModeFx ? ' and ' : '') + (componentEditModeFx ? 'disabled' : '');
  const actionText2 = (hiddenFx ? 'showing' : '') + (hiddenFx && componentEditModeFx ? '/' : '') + (componentEditModeFx ? 'enabled' : '');

  const settingsEditor = useMemo(() => {
    const renderRerquired = isSelected && settingsPanelRef.current;

    if (!renderRerquired)
      return null;

    const createPortalInner = true
      ? createPortal
      : (a) => a;
    const result = createPortalInner((
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseOver={(e) => e.stopPropagation()}
        onMouseOut={(e) => e.stopPropagation()}
      >
        <ComponentProperties
          componentModel={componentModel}
          readOnly={readOnly}
          toolboxComponent={getToolboxComponent(componentModel.type)}
        />
      </div>
    ), settingsPanelRef.current, "propertiesPanel");

    return result;
  }, [isSelected]);

  // Apply dimensions to the outermost wrapper so width/height affect the actual component size
  const shouldApplyDimensions = componentModel.type === 'container';

  const deviceModel = isValidDeviceKey(activeDevice)
    ? { ...componentModel, ...componentModel[activeDevice] }
    : componentModel;

  const dimensions = deviceModel?.container?.dimensions ?? deviceModel?.dimensions ?? {};

  const componentStyle = useMemo(() => {
    if (!shouldApplyDimensions) return { margin: '0px' };
    return {
      boxSizing: 'border-box' as const,
      width: addPx(dimensions?.width),
      minWidth: addPx(dimensions?.minWidth),
      maxWidth: addPx(dimensions?.maxWidth),
      height: addPx(dimensions?.height),
      minHeight: addPx(dimensions?.minHeight),
      maxHeight: addPx(dimensions?.maxHeight),
      margin: '0px'
    };
  }, [dimensions, shouldApplyDimensions]);

  const renderComponentModel = useMemo(() => {
    if (!isValidDeviceKey(activeDevice)) {
      return componentModel;
    }
    const deviceOverrides = componentModel[activeDevice] ?? {};
    return {
      ...componentModel,
      [activeDevice]: {
        ...deviceOverrides,
        dimensions: { ...dimensions, width: '100%', height: '100%' },
      },
    };
  }, [componentModel, activeDevice, dimensions]);

  return (
    <div
      className={classNames(styles.shaComponent, {
        "selected": isSelected,
        'has-config-errors': invalidConfiguration,
      })}
      style={componentStyle}
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
      <div style={fullSizeBoxStyle}>
        <DragWrapper componentId={componentModel.id} readOnly={readOnly} >
          <div style={paddedBoxStyle}>
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
