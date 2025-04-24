import React, { FC, MutableRefObject, PropsWithChildren, useMemo, useState } from 'react';
import { ShaForm } from '@/providers/form';
import { Button, Tooltip } from 'antd';
import { useFormDesignerState, useFormDesignerActions } from '@/providers/formDesigner';
import { DeleteFilled, FunctionOutlined } from '@ant-design/icons';
import { useStyles } from '../styles/styles';

interface IDragWrapperProps {
  componentId: string;
  componentRef: MutableRefObject<any>;
  readOnly?: boolean;
}

export const DragWrapper: FC<PropsWithChildren<IDragWrapperProps>> = (props) => {
  const { styles } = useStyles();
  
  const { selectedComponentId, isDebug } = useFormDesignerState();
  const { setSelectedComponent, deleteComponent } = useFormDesignerActions();
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
          {typeof(componentModel.propertyName) === 'string' ? componentModel.propertyName : ''}
          {typeof(componentModel.propertyName) === 'object' && <FunctionOutlined />}
        </div>
      )}
      {Boolean(componentModel.componentName) && (
        <div><strong>Component name: </strong>{componentModel.componentName}</div>
      )}
    </div>
  ), [componentModel]);

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
  const onDeleteClick = () => {
    deleteComponent({ componentId: componentModel.id });
  };

  return (
    <div className={styles.componentDragHandle} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      {!props?.readOnly && isOpen && (
        <div className={styles.shaComponentControls}>
          <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
        </div>
      )}

      <Tooltip title={tooltip} placement="right" open={isOpen}>
        {props.children}
      </Tooltip>
    </div>
  );
};

export default DragWrapper;