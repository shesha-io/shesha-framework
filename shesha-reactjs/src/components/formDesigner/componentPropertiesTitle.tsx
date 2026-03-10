import React, { FC } from 'react';
import { Button } from 'antd';
import { CopyOutlined, DeleteFilled } from '@ant-design/icons';
import { useFormDesigner, useFormDesignerReadOnly, useFormDesignerSelectedComponent } from '@/providers/formDesigner';
import { useStyles } from './styles/styles';
import { isDefined } from '@/utils/nullables';

export const ComponentPropertiesTitle: FC = ({}) => {
  const component = useFormDesignerSelectedComponent();
  const readOnly = useFormDesignerReadOnly();
  const { deleteComponent, duplicateComponent } = useFormDesigner();
  const { styles } = useStyles();

  // TODO: calculate actual component label
  const componentLabel = isDefined(component) && typeof (component.label) === 'string'
    ? component.label
    : 'Properties';

  const onDeleteClick = (): void => {
    if (!readOnly && component)
      deleteComponent({ componentId: component.id });
  };
  const onDuplicateClick = (): void => {
    if (!readOnly && component)
      duplicateComponent({ componentId: component.id });
  };

  return (
    <div className={styles.componentPropertiesActions}>
      {componentLabel}
      {component && !readOnly && (
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
