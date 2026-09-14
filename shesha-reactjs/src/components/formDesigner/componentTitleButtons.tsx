import { FC } from 'react';
import { Button } from 'antd';
import { BugOutlined, CopyOutlined, DeleteFilled } from '@ant-design/icons';
import { useFormDesigner, useFormDesignerReadOnly, useFormDesignerSelectedComponent } from '@/providers/formDesigner';
import { isDefined } from '@/utils';
import { useSheshaApplication } from '@/providers';

export const ComponentTitleButtons: FC = ({}) => {
  const { isDebugMode } = useSheshaApplication();
  const component = useFormDesignerSelectedComponent();
  const readOnly = useFormDesignerReadOnly();
  const { deleteComponent, duplicateComponent, validateComponentAsync } = useFormDesigner();

  const onDeleteClick = (): void => {
    if (!readOnly && component)
      deleteComponent({ componentId: component.id });
  };

  const onDuplicateClick = (): void => {
    if (!readOnly && component)
      duplicateComponent({ componentId: component.id });
  };

  const onDebugClick = (): void => {
    if (isDefined(component))
      void validateComponentAsync(component);
  };

  return component && !readOnly
    ? (
      <>
        {isDebugMode && (
          <Button
            type="text"
            icon={<BugOutlined />}
            onClick={onDebugClick}
            size="small"
            title="Debug"
          />
        )}
        <Button
          type="text"
          icon={<CopyOutlined />}
          onClick={onDuplicateClick}
          size="small"
          title="Duplicate component"
        />
        <Button
          type="text"
          icon={<DeleteFilled color="red" />}
          onClick={onDeleteClick}
          size="small"
          danger
          title="Delete component"
        />
      </>
    )
    : undefined;
};
