import React, { FC } from 'react';
import { Button } from 'antd';
import { CopyOutlined, DeleteFilled } from '@ant-design/icons';
import { useFormDesigner } from '../../providers/formDesigner';

export interface IProps {}

export const ComponentPropertiesTitle: FC<IProps> = ({}) => {
  const { deleteComponent, duplicateComponent, selectedComponentId, readOnly } = useFormDesigner();

  const onDeleteClick = () => {
    if (!readOnly)
      deleteComponent({ componentId: selectedComponentId });
  };
  const onDuplicateClick = () => {
    if (!readOnly)
      duplicateComponent({ componentId: selectedComponentId });
  }

  return (
    <div className="component-properties-actions">
      Properties
      {selectedComponentId && !readOnly && (
        <div className="action-buttons">
          <Button
            icon={<CopyOutlined />}
            onClick={onDuplicateClick}
            size="small"
            title="Duplicate component"
          />
          <Button
            icon={<DeleteFilled color="red" />}
            onClick={onDeleteClick}
            size="small"
            danger
            title="Delete component"
          />
        </div>
      )}
    </div>
  );
};

export default ComponentPropertiesTitle;
