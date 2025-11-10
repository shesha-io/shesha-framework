import React, { FC } from 'react';
import { Button } from 'antd';
import { CopyOutlined, DeleteFilled } from '@ant-design/icons';
import { useFormDesigner, useFormDesignerMarkup, useFormDesignerReadOnly, useFormDesignerSelectedComponentId } from '@/providers/formDesigner';
import { useStyles } from './styles/styles';
import { isDefined } from '@/utils/nullables';

export const ComponentPropertiesTitle: FC = ({}) => {
  const formFlatMarkup = useFormDesignerMarkup();
  const selectedComponentId = useFormDesignerSelectedComponentId();
  const readOnly = useFormDesignerReadOnly();
  const { deleteComponent, duplicateComponent } = useFormDesigner();
  const { styles } = useStyles();

  const component = formFlatMarkup?.allComponents?.[selectedComponentId];
  // TODO: calculate actual component label
  const componentLabel = isDefined(component) && typeof (component.label) === 'string'
    ? component.label
    : 'Properties';

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
