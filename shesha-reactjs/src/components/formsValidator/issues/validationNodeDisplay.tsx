import { ValidationNodeRef } from '@/interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { FC } from 'react';
import { ComponentIcon } from './componentIcon';
import { Space } from 'antd';

export interface IValidationNodeDisplayProps {
  nodeRef: ValidationNodeRef;
}

export const ValidationNodeDisplay: FC<IValidationNodeDisplayProps> = ({ nodeRef }) => {
  const componentId = isDefined(nodeRef) && nodeRef.kind === 'component' && isDefined(nodeRef.id)
    ? nodeRef.id
    : '';
  const stringLabel = typeof (nodeRef.label) === "string" && !isNullOrWhiteSpace(nodeRef.label) ? nodeRef.label : '';
  return (
    <Space size={4}>
      {!isNullOrWhiteSpace(componentId) && <ComponentIcon componentId={componentId} />}
      <span>
        {!isNullOrWhiteSpace(stringLabel)
          ? <>{nodeRef.label}</>
          : !isNullOrWhiteSpace(nodeRef.name)
            ? <>{nodeRef.name}</>
            : !isNullOrWhiteSpace(nodeRef.id)
              ? `#${nodeRef.id}`
              : `[${nodeRef.index ?? 0}]`}
      </span>
    </Space>
  );
};
