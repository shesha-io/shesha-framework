import React, { FC } from 'react';
import { Button } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { IConfigurableColumnGroup } from '../../../../../../providers/datatableColumnsConfigurator/models';
import { useColumnsConfigurator } from '../../../../../../providers/datatableColumnsConfigurator';
import ColumnsContainer from './columnsContainer';
import DragHandle from './dragHandle';

export interface IProps extends IConfigurableColumnGroup {
  index: number[];
}

export const ColumnsGroup: FC<IProps> = props => {
  const { deleteGroup, selectedItemId, readOnly } = useColumnsConfigurator();

  const onDeleteClick = () => {
    deleteGroup(props.id);
  };

  const classes = ['sha-toolbar-item'];
  if (selectedItemId === props.id) classes.push('selected');

  return (
    <div className={classes.reduce((a, c) => a + ' ' + c)}>
      <div className="sha-toolbar-group-header">
        <DragHandle id={props.id} />
        <strong>{props.caption}</strong>
        {!readOnly && (
          <div className="sha-toolbar-item-controls">
            <Button icon={<DeleteFilled color="red" />} onClick={onDeleteClick} size="small" danger />
          </div>
        )}
      </div>
      <div className="sha-toolbar-group-container">
        <ColumnsContainer index={props.index} items={props.childItems || []} />
      </div>
    </div>
  );
};

export default ColumnsGroup;
