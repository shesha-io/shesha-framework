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
import { EditMode, IConfigurableFormComponent } from '@/providers';
import {
  EditOutlined,
  EyeInvisibleOutlined,
  FunctionOutlined,
  StopOutlined
} from '@ant-design/icons';
import { getActualPropertyValue, useAvailableConstantsData } from '@/providers/form/utils';
import { isPropertySettings } from '@/designer-components/_settings/utils';
import { Show } from '@/components/show';
import { Tooltip } from 'antd';
import { ShaForm, useIsDrawingForm } from '@/providers/form';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';
import { ComponentProperties } from '../componentPropertiesPanel/componentProperties';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';

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

  return (
    <div
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
      <div>
        <DragWrapper componentId={componentModel.id} componentRef={componentRef} readOnly={readOnly} >
          <div style={{ padding: '5px 3px' }}>
            <FormComponent componentModel={componentModel} componentRef={componentRef} />
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

  return <ConfigurableFormComponentDesignerMemo {...props} {...{selectedComponentId, readOnly, settingsPanelRef, hidden, componentEditMode}}/>;
};

export interface IConfigurableFormComponentProps {
  id: string;
  model?: IConfigurableFormComponent;
}

export const ConfigurableFormComponent: FC<IConfigurableFormComponentProps> = ({id, model}) => {
  const isDrawing = useIsDrawingForm();

  const componentRef = useRef(null);
  const componentMarkupModel = ShaForm.useComponentModel(id);
  const componentModel = model?.isDynamic ? model : componentMarkupModel;

  const ComponentRenderer = !isDrawing || componentModel?.isDynamic
    ? FormComponent
    : ConfigurableFormComponentDesigner;

  return (
    <ComponentRenderer componentModel={componentModel} componentRef={componentRef}  />
  );
};