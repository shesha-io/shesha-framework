import React, { FC, MutableRefObject, PropsWithChildren, useEffect, useState } from 'react';
import { useForm } from '@/providers/form';
import { useMetadata } from '@/providers';
import { Tooltip } from 'antd';
import { useFormDesigner } from '@/providers/formDesigner';
import { useDataContext } from '@/providers/dataContextProvider';

interface IDragWrapperProps {
  componentId: string;
  componentRef: MutableRefObject<any>;
}

export const DragWrapper: FC<PropsWithChildren<IDragWrapperProps>> = (props) => {
  const { getComponentModel } = useForm();
  const { selectedComponentId, setSelectedComponent, isDebug } = useFormDesigner();

  const [selected, setSelected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const metadata = useMetadata(false);
  const dataContext = useDataContext(false);

  const componentModel = getComponentModel(props.componentId);

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
          <strong>Name:</strong> {componentModel.propertyName}
        </div>
      )}
    </div>
  );

  // used to update metadata, context and componentRef after adding component to form
  useEffect(() => {
    if (selectedComponentId === props.componentId && !selected) {
      setSelectedComponent(props.componentId, metadata?.id, dataContext, props.componentRef);
    }
  }, [selected]);

  const onClick = (e) => {
    e.stopPropagation();
    setSelectedComponent(
      selectedComponentId === props.componentId ? null : props.componentId,
      metadata?.id,
      dataContext,
      props.componentRef
    );
    setSelected(true);
  };

  const onMouseOver = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const onMouseOut = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div className="sha-component-drag-handle" onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      <Tooltip title={tooltip} placement="right" open={isOpen}>
        {props.children}
      </Tooltip>
    </div>
  );
};

export default DragWrapper;
