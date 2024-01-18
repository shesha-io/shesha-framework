import { DeleteFilled } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC } from 'react';
import { useColumnsConfigurator } from '@/providers/datatableColumnsConfigurator';
import { ColumnsItemProps, IConfigurableColumnGroup } from '@/providers/datatableColumnsConfigurator/models';
import DragHandle from './dragHandle';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import classNames from 'classnames';

export interface IContainerRenderArgs {
  index?: number[];
  items?: ColumnsItemProps[];
}

export interface IProps extends IConfigurableColumnGroup {
  index: number[];
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
}

export const ColumnsGroup: FC<IProps> = (props) => {
  const { deleteGroup, selectedItemId, readOnly } = useColumnsConfigurator();
  const { styles } = useStyles();

  const onDeleteClick = () => {
    deleteGroup(props.id);
  };

  return (
    <div className={classNames(styles.shaToolbarItem, { selected: selectedItemId === props.id })}>
      <div className={styles.shaToolbarGroupHeader}>
        <DragHandle id={props.id} />
        <strong>{props.caption}</strong>
        {!readOnly && (
          <div className={styles.shaToolbarItemControls}>
            <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          </div>
        )}
      </div>
      <div className={styles.shaToolbarGroupContainer}>
        {props.containerRendering({ index: props.index, items: props.childItems || [] })}
      </div>
    </div>
  );
};

export default ColumnsGroup;
