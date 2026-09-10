import React from 'react';
import classNames from 'classnames';
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';

interface DeleteActionProps {
  action: 'delete';
  disabled: boolean;
  onDelete: () => void;
}

interface DragActionProps {
  action: 'drag';
  disabled: boolean;
  onDragStart: React.DragEventHandler<HTMLButtonElement>;
  onDragEnd: React.DragEventHandler<HTMLButtonElement>;
}

type ItemActionProps = DeleteActionProps | DragActionProps;

export const ItemAction: React.FC<ItemActionProps> = (props) => {
  const isDelete = props.action === 'delete';
  const label = isDelete ? 'Delete' : 'Drag';

  return (
    <button
      type="button"
      className={classNames(
        'sha-query-builder-item-action',
        isDelete ? 'sha-query-builder-item-action--delete' : 'sha-query-builder-item-action--drag',
      )}
      onClick={props.action === 'delete' ? props.onDelete : undefined}
      draggable={props.action === 'drag' && !props.disabled}
      disabled={props.disabled}
      onDragStart={props.action === 'drag' ? props.onDragStart : undefined}
      onDragEnd={props.action === 'drag' ? props.onDragEnd : undefined}
      aria-label={label}
      title={label}
    >
      {isDelete ? <DeleteOutlined /> : <HolderOutlined />}
    </button>
  );
};
