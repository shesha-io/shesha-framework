import React, { FC, MutableRefObject, PropsWithChildren, useState } from 'react';
import { ShaForm } from '@/providers/form';
import { Tooltip } from 'antd';
import { useFormDesignerState, useFormDesignerActions } from '@/providers/formDesigner';
import { FunctionOutlined } from '@ant-design/icons';
import { useStyles } from '../styles/styles';

interface IDragWrapperProps {
  componentId: string;
  componentRef: MutableRefObject<any>;
  readOnly?: boolean;
  inCompleteConfiguration?: boolean;
  inConfigurationError?: string;
}

export const DragWrapper: FC<PropsWithChildren<IDragWrapperProps>> = (props) => {
  const { styles } = useStyles();

  const { selectedComponentId, isDebug } = useFormDesignerState();
  const { setSelectedComponent } = useFormDesignerActions();
  const [isOpen, setIsOpen] = useState(false);

  const componentModel = ShaForm.useComponentModel(props.componentId);

  const tooltip = (
    <div>
      {isDebug && (
        <div>
          <strong>Id:</strong> {componentModel.id}
        </div>
      )}
      <div>
        <strong>Type:</strong> {componentModel.type}
      </div>
      {Boolean(componentModel.propertyName) && (
        <div>
          <strong>Property name: </strong>
          {typeof (componentModel.propertyName) === 'string' ? componentModel.propertyName : ''}
          {typeof (componentModel.propertyName) === 'object' && <FunctionOutlined />}
        </div>
      )}
      {Boolean(componentModel.componentName) && (
        <div><strong>Component name: </strong>{componentModel.componentName}</div>
      )}
    </div>
  );

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    if (selectedComponentId !== props.componentId)
      setSelectedComponent(
        props.componentId,
        props.componentRef
      );
  };

  const onMouseOver = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setIsOpen(true);
  };

  const onMouseOut = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setIsOpen(false);
  };

  const showComponentInfo = !props.inCompleteConfiguration && isOpen;

  return (
    <div className={styles.componentDragHandle} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      <Tooltip title={tooltip} placement="right" open={showComponentInfo}>
        {props.children}
      </Tooltip>
    </div>
  );
};

export default DragWrapper;