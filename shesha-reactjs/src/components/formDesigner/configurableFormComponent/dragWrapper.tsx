import React, { FC, PropsWithChildren, useMemo, useState } from 'react';
import { ShaForm } from '@/providers/form';
import { Tooltip } from 'antd';
import { useFormDesigner, useFormDesignerSelectedComponentId, useFormDesignerIsDebug } from '@/providers/formDesigner';
import { FunctionOutlined } from '@ant-design/icons';
import { useStyles } from '../styles/styles';

interface IDragWrapperProps {
  componentId: string;
  readOnly?: boolean;
}

export const DragWrapper: FC<PropsWithChildren<IDragWrapperProps>> = (props) => {
  const { styles } = useStyles();

  const selectedComponentId = useFormDesignerSelectedComponentId();
  const isDebug = useFormDesignerIsDebug();
  const { setSelectedComponent } = useFormDesigner();
  const [isOpen, setIsOpen] = useState(false);

  const componentModel = ShaForm.useComponentModel(props.componentId);

  const tooltip = useMemo(() => (
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
  ), [componentModel.componentName, componentModel.id, componentModel.propertyName, componentModel.type, isDebug]);

  const onClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();

    if (selectedComponentId !== props.componentId)
      setSelectedComponent(
        props.componentId,
      );
  };

  const onMouseOver = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    setIsOpen(true);
  };

  const onMouseOut = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div className={styles.componentDragHandle} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      <Tooltip title={tooltip} placement="right" open={isOpen}>
        {props.children}
      </Tooltip>
    </div>
  );
};

export default DragWrapper;
