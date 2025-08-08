import classNames from 'classnames';
import DragWrapper from './dragWrapper';
import FormComponent from '../formComponent';
import React, {
  FC,
  MutableRefObject,
  memo,
  useMemo,
  useRef
} from 'react';
import { createPortal } from 'react-dom';
import ValidationIcon from './validationIcon';
import { EditMode, IConfigurableFormComponent, useCanvas } from '@/providers';
import {
  EditOutlined,
  EyeInvisibleOutlined,
  FunctionOutlined,
  StopOutlined
} from '@ant-design/icons';
import { getActualPropertyValue, pickStyleFromModel, useAvailableConstantsData } from '@/providers/form/utils';
import { isPropertySettings } from '@/designer-components/_settings/utils';
import { Show } from '@/components/show';
import { Tooltip } from 'antd';
import { ShaForm, useIsDrawingForm } from '@/providers/form';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';
import { ComponentProperties } from '../componentPropertiesPanel/componentProperties';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { useShaFormInstance } from '@/providers';

export interface IConfigurableFormComponentDesignerProps {
  componentModel: IConfigurableFormComponent;
  componentRef: MutableRefObject<any>;
  selectedComponentId?: string;
  readOnly?: boolean;
  settingsPanelRef?: MutableRefObject<any>;
  hidden?: boolean;
  componentEditMode?: EditMode;
}

const ConfigurableFormComponentDesignerInner: FC<IConfigurableFormComponentDesignerProps> = ({
  componentModel,
  componentRef,
  selectedComponentId,
  readOnly,
  settingsPanelRef,
  hidden,
  componentEditMode
}) => {
  const { styles } = useStyles();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const { formMode } = useShaFormInstance();
  const { activeDevice } = useCanvas();
  const isFileList = getToolboxComponent(componentModel.type)?.type === 'attachmentsEditor';
  const isFileUpload = getToolboxComponent(componentModel.type)?.type === 'fileUpload';

  const desktopConfig = componentModel?.[activeDevice] || {};
  const originalDimensions = desktopConfig?.dimensions || {};
  const originalStylingBox = JSON.parse(desktopConfig.stylingBox || '{}');

  const hasLabel = componentModel.label && componentModel.label.toString().length > 0;
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

    const createPortalInner = true
      ? createPortal
      : a => a;
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

  const stylingBoxAsCSS = pickStyleFromModel(originalStylingBox);
  const { paddingBottom, paddingTop, paddingRight, paddingLeft, marginLeft, marginRight, marginBottom, marginTop } = stylingBoxAsCSS;

  const renderStylingBox = useMemo(() => {
      return JSON.stringify({
        paddingBottom: originalStylingBox.paddingBottom,
        paddingLeft: originalStylingBox.paddingLeft,
        paddingRight: originalStylingBox.paddingRight,
        paddingTop: originalStylingBox.paddingTop
      });
    
  }, [formMode, originalStylingBox, desktopConfig.stylingBox]);

  const renderComponentModel = useMemo(() => {
    return {
      ...componentModel,
      [activeDevice]: {
        ...desktopConfig,
        stylingBox: renderStylingBox,
        flexBasis: desktopConfig?.dimensions?.width
      }
    };
  }, [componentModel, desktopConfig, renderStylingBox, originalDimensions, formMode]);

  const rootContainerStyle = useMemo(() => {
    const baseStyle = {
      boxSizing: 'border-box' as const,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
    };

    if (formMode === 'designer') {
      return {
        ...baseStyle,
        ...originalDimensions,
        width:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.width : desktopConfig?.dimensions?.width,
        maxWidth:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.maxWidth : desktopConfig?.dimensions?.maxWidth,
        minWidth:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.minWidth : desktopConfig?.dimensions?.minWidth,
        height:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.height :  desktopConfig?.dimensions?.height,
        minHeight:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.minHeight : desktopConfig?.dimensions?.minHeight,
        maxHeight:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.maxHeight : desktopConfig?.dimensions?.maxHeight,
      };
    } else {
      return {
        ...baseStyle,
        width: isFileList || isFileUpload ? desktopConfig.container?.dimensions?.width : desktopConfig?.dimensions?.width,
        height: isFileList || isFileUpload ? desktopConfig.container?.dimensions?.height : desktopConfig?.dimensions?.height,
        minHeight:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.minHeight : desktopConfig?.dimensions?.minHeight,
        maxHeight:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.maxHeight : desktopConfig?.dimensions?.maxHeight,
        maxWidth:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.maxWidth : desktopConfig?.dimensions?.maxWidth,
        minWidth:  isFileList || isFileUpload ? desktopConfig.container?.dimensions?.minWidth : desktopConfig?.dimensions?.minWidth,
        flexShrink: 0,
        flexBasis: originalDimensions.width,
      };
    }
  }, [formMode, originalDimensions, hasLabel, marginLeft, marginRight, marginTop, marginBottom, paddingTop, paddingBottom, paddingLeft, paddingRight]);

  return (
    <div
      style={rootContainerStyle}
      className={classNames(styles.shaComponent, {
        selected: isSelected,
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

      <div style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        <DragWrapper componentId={componentModel.id} componentRef={componentRef} readOnly={readOnly}>
          <div style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            <FormComponent
              componentModel={renderComponentModel}
              componentRef={componentRef}
            />
          </div>
        </DragWrapper>
      </div>
      {settingsEditor}
    </div>
  );
};

const ConfigurableFormComponentDesignerMemo = memo(ConfigurableFormComponentDesignerInner);

export const ConfigurableFormComponentDesigner: FC<IConfigurableFormComponentDesignerProps> = (props) => {
  const allData = useAvailableConstantsData({ topContextId: 'all' });
  const { selectedComponentId, readOnly, settingsPanelRef } = useFormDesignerState();
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

  const componentRef = useRef(null);
  const componentMarkupModel = ShaForm.useComponentModel(id);
  const componentModel = model?.isDynamic ? model : componentMarkupModel;

  const ComponentRenderer = !isDrawing || componentModel?.isDynamic
    ? FormComponent
    : ConfigurableFormComponentDesigner;

  return (
    <ComponentRenderer componentModel={componentModel} componentRef={componentRef} />
  );
};