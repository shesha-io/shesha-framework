import classNames from 'classnames';
import React, { FC, PropsWithChildren, useState } from 'react';
import { Button } from 'antd';
import { DeleteFilled, MenuOutlined } from '@ant-design/icons';
import { InsertItemMarker } from './insertItemMarker';
import { useStyles } from './styles/styles';

export type ItemInsertPosition = 'before' | 'after';

export interface IListItemWrapperProps extends PropsWithChildren {
  onDelete: () => void;
  onDragHandleClick: () => void;
  onInsert: (insertPosition: ItemInsertPosition) => void;
  readOnly?: boolean;
  isLast: boolean;
  className?: string;
}

interface NewItemPlaceHolderProps {
  className?: string;
}
const NewItemPlaceHolder: FC<NewItemPlaceHolderProps> = ({ className }) => {
  const { styles } = useStyles();
  return (<div className={classNames(styles.listInsertPlaceholder, className)}></div>);
};

export const ListItemWrapper: FC<IListItemWrapperProps> = ({ children, onDelete, onDragHandleClick, onInsert, readOnly, isLast, className }) => {
  const [placeholderPosition, setPlaceholderPosition] = useState<ItemInsertPosition>(null);
  const { styles } = useStyles();

  const onDeleteClick = (): void => {
    onDelete();
  };

  return (
    <div className={classNames(styles.listItem, className)}>
      {!readOnly && (
        <>
          <InsertItemMarker
            onClick={() => onInsert('before')}
            onOpenChange={(visible) => (setPlaceholderPosition(visible ? 'before' : null))}
          />
          {placeholderPosition === 'before' && <NewItemPlaceHolder className={placeholderPosition} />}
        </>
      )}
      <span className={styles.dragHandle} onClick={onDragHandleClick}>
        <MenuOutlined className={styles.dragIcon} />
      </span>
      <div className={styles.listItemContent}>
        {children}
      </div>
      {!readOnly && (
        <>
          <div className={styles.listItemControls}>
            <Button
              icon={<DeleteFilled color="red" />}
              onClick={onDeleteClick}
              size="small"
              shape="circle"
              danger
              type="link"
            />
          </div>
          {isLast && (
            <>
              {placeholderPosition === 'after' && <NewItemPlaceHolder className={placeholderPosition} />}
              <InsertItemMarker
                onClick={() => onInsert('after')}
                onOpenChange={(visible) => (setPlaceholderPosition(visible ? 'after' : null))}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
