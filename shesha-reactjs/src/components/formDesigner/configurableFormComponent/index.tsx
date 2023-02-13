import React, { FC, MutableRefObject, useRef } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteFilled, StopOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import FormComponent from '../formComponent';
import { useForm } from '../../../providers/form';
import DragHandle from './dragHandle';
import ValidationIcon from './validationIcon';
import { Show } from '../../show';
import classNames from 'classnames';
import CustomErrorBoundary from '../../customErrorBoundary';
import { useFormDesigner } from '../../../providers/formDesigner';
import { IConfigurableFormComponent } from '../../../interfaces';

export interface IConfigurableFormComponentProps {
  id: string;
  index: number;
}

const ConfigurableFormComponent: FC<IConfigurableFormComponentProps> = ({ id }) => {
  const { formMode, getComponentModel } = useForm();
  const designer = useFormDesigner(false);

  const componentModel = getComponentModel(id);
  const componentRef = useRef(null);
  const isDesignMode = formMode === 'designer';

  if (!designer || !isDesignMode || componentModel?.isDynamic) return (
    <ComponentRenderer id={id} componentRef={componentRef} />
  );

  return (
    <ConfigurableFormComponentDesigner
      componentModel={componentModel}
      componentRef={componentRef}
    />
  );
};

interface IComponentRendererProps {
  id: string;
  componentRef: MutableRefObject<any>;
}
const ComponentRenderer: FC<IComponentRendererProps> = ({ id, componentRef }) => {
  return (
    <CustomErrorBoundary>
      <FormComponent id={id} componentRef={componentRef} />
    </CustomErrorBoundary>
  );
}

interface IConfigurableFormComponentDesignerProps {
  componentModel: IConfigurableFormComponent;
  componentRef: MutableRefObject<any>;
}
const ConfigurableFormComponentDesigner: FC<IConfigurableFormComponentDesignerProps> = ({ componentModel, componentRef }) => {
  const {
    visibleComponentIds,
    enabledComponentIds,
  } = useForm();
  const {
    deleteComponent,
    selectedComponentId,
    readOnly: readonly,
  } = useFormDesigner();

  const onDeleteClick = () => {
    deleteComponent({ componentId: componentModel.id });
  };

  const hiddenByCondition = visibleComponentIds && !visibleComponentIds.includes(componentModel.id);
  const disabledByCondition = enabledComponentIds && !enabledComponentIds.includes(componentModel.id);

  const invalidConfiguration =
    componentModel.settingsValidationErrors && componentModel.settingsValidationErrors.length > 0;

  return (
    <div
      className={classNames('sha-component', {
        selected: selectedComponentId === componentModel.id,
        'has-config-errors': invalidConfiguration,
      })}
    >
      <span className="sha-component-indicator">
        <Show when={componentModel.hidden || hiddenByCondition}>
          <Tooltip title="This component is hidden by condition. It's now showing because we're in a designer mode">
            <EyeInvisibleOutlined />
          </Tooltip>
        </Show>

        <Show when={componentModel.disabled || disabledByCondition}>
          <Tooltip title="This component is disabled by condition. It's now enabled because we're in a designer mode">
            <StopOutlined />
          </Tooltip>
        </Show>
      </span>

      {invalidConfiguration && <ValidationIcon validationErrors={componentModel.settingsValidationErrors} />}
      {!readonly && (
        <div className="sha-component-controls">
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
      )}
      <div>
        <DragHandle componentId={componentModel.id} componentRef={componentRef} />
        <div style={{ paddingLeft: '15px' }}>
          <ComponentRenderer id={componentModel.id} componentRef={componentRef} />
        </div>
      </div>
    </div>
  );
}

export default ConfigurableFormComponent;
