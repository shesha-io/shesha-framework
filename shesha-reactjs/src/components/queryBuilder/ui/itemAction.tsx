import React from 'react';
import classNames from 'classnames';
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';

interface ItemActionProps {
  action: 'delete' | 'drag';
  disabled: boolean;
  onDelete?: (() => void) | undefined;
  onDragStart?: React.DragEventHandler<HTMLButtonElement> | undefined;
  onDragEnd?: React.DragEventHandler<HTMLButtonElement> | undefined;
}

export const ItemAction: React.FC<ItemActionProps> = ({ action, disabled, onDelete, onDragEnd, onDragStart }) => {
  const isDelete = action === 'delete';

  return (
    <button
      type="button"
      className={classNames(
        'sha-query-builder-item-action',
        isDelete ? 'sha-query-builder-item-action--delete' : 'sha-query-builder-item-action--drag',
      )}
      onClick={isDelete ? onDelete : undefined}
      draggable={!isDelete && !disabled}
      disabled={disabled}
      onDragStart={!isDelete ? onDragStart : undefined}
      onDragEnd={!isDelete ? onDragEnd : undefined}
      aria-label={isDelete ? 'Delete' : 'Drag'}
      title={isDelete ? 'Delete' : 'Drag'}
    >
      {isDelete ? <DeleteOutlined /> : <HolderOutlined />}
    </button>
  );
};
