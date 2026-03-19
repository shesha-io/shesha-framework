import React from 'react';
import { HolderOutlined } from '@ant-design/icons';
import type { RuleProps } from '@react-awesome-query-builder/antd';

export const RuleDragHandlePlaceholder = (props: RuleProps): JSX.Element | null => {
  const { config, reordableNodesCnt, isLocked, parentField, parentFieldCanReorder } = props;

  const canReorder = config?.settings?.canReorder !== false;
  const canReorderInParent = !parentField || Boolean(parentFieldCanReorder);
  const showNativeDragHandle = canReorder && canReorderInParent && Number(reordableNodesCnt || 0) > 1 && !Boolean(isLocked);

  if (!canReorder || !canReorderInParent || Boolean(isLocked) || showNativeDragHandle)
    return null;

  return (
    <div className="sha-query-builder-rule-drag-placeholder qb-drag-handler rule--drag-handler" aria-hidden>
      <HolderOutlined />
    </div>
  );
};
