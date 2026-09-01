import { FC, PropsWithChildren, useMemo, useState } from 'react';
import * as React from 'react';
import { ShaForm } from '@/providers/form';
import { Tooltip } from 'antd';
import { useFormDesigner, useFormDesignerSelectedComponentId, useFormDesignerIsDebug } from '@/providers/formDesigner';
import { FunctionOutlined } from '@ant-design/icons';

interface IDragWrapperProps {
  componentId: string;
  readOnly?: boolean | undefined;
  className?: string | undefined;
}

export const DragWrapper: FC<PropsWithChildren<IDragWrapperProps>> = (props) => {
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

  const onMouseEnter = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    setIsOpen(true);
  };

  const onMouseLeave = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    setIsOpen(false);
  };

  return (
    // `pointerEvents: none` keeps the overlay out of hit-testing, otherwise moving the cursor onto the
    // tooltip triggers mouse leave on the wrapper and the tooltip flickers open/closed under the cursor
    <Tooltip title={tooltip} placement="right" open={isOpen} styles={{ root: { pointerEvents: 'none' } }}>
      <div className={props.className} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {props.children}
      </div>
    </Tooltip>
  );
};

export default DragWrapper;
