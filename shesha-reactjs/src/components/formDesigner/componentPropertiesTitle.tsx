import React, { FC } from 'react';
import { Button } from 'antd';
import { CopyOutlined, DeleteFilled } from '@ant-design/icons';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useStyles } from './styles/styles';

export const ComponentPropertiesTitle: FC = ({}) => {
  const selectedComponentId = useFormDesignerStateSelector((x) => x.selectedComponentId);
  const formFlatMarkup = useFormDesignerStateSelector((x) => x.formFlatMarkup);
  const readOnly = useFormDesignerStateSelector((x) => x.readOnly);
  const { deleteComponent, duplicateComponent } = useFormDesignerActions();
  const { styles } = useStyles();

  const componentLabel = formFlatMarkup?.allComponents?.[selectedComponentId]?.label ?? 'Properties';

  const onDeleteClick = (): void => {
    if (!readOnly)
      deleteComponent({ componentId: selectedComponentId });
  };
  const onDuplicateClick = (): void => {
    if (!readOnly)
      duplicateComponent({ componentId: selectedComponentId });
  };

  return (
    <div className={styles.componentPropertiesActions}>
      {componentLabel}
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
