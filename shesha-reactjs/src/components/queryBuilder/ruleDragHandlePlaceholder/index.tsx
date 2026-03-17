import React from 'react';
import { HolderOutlined } from '@ant-design/icons';
import type { RuleProps } from '@react-awesome-query-builder/antd';

export const RuleDragHandlePlaceholder = (props: RuleProps): JSX.Element | null => {
  const { config, reordableNodesCnt, isLocked } = props;

  const canReorder = config?.settings?.canReorder !== false;
  const showNativeDragHandle = canReorder && Number(reordableNodesCnt || 0) > 1 && !Boolean(isLocked);

  if (!canReorder || showNativeDragHandle)
    return null;

  return (
    <div className="sha-query-builder-rule-drag-placeholder" aria-hidden>
      <HolderOutlined />
    </div>
  );
};

