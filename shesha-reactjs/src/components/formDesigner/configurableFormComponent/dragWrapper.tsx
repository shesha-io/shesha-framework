import React, { FC, MutableRefObject, PropsWithChildren, useState } from 'react';
import { useForm } from '@/providers/form';
import { useMetadata } from '@/providers';
import { Button, Tooltip } from 'antd';
import { useFormDesigner } from '@/providers/formDesigner';
import { useDataContext } from '@/providers/dataContextProvider';
import { DeleteFilled } from '@ant-design/icons';
import { useStyles } from '../styles/styles';

interface IDragWrapperProps {
  componentId: string;
  componentRef: MutableRefObject<any>;
  readOnly?: boolean;
}

export const DragWrapper: FC<PropsWithChildren<IDragWrapperProps>> = (props) => {
  const { styles } = useStyles();
  const { getComponentModel } = useForm();
  const { selectedComponentId, setSelectedComponent, isDebug, deleteComponent } = useFormDesigner();
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

  const onClick = (e) => {
    e.stopPropagation();
    setSelectedComponent(
      selectedComponentId === props.componentId ? null : props.componentId,
      metadata?.id,
      dataContext,
      props.componentRef
    );
  };

  const onMouseOver = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const onMouseOut = (e) => {
    e.stopPropagation();
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
