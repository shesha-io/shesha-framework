import React, { FC } from 'react';

interface IGroupDragActionProps {
  isRoot?: boolean;
  isLocked?: boolean;
  parentField?: string;
  parentFieldCanReorder?: boolean;
  reordableNodesCnt?: number;
  // The library types this as `Function`; we accept that and narrow it at the call site.
  handleDraggerMouseDown?: Function;
  config?: {
    settings?: {
      canReorder?: boolean;
      renderIcon?: (props: { type: 'drag' }, ctx?: unknown) => React.ReactNode;
    };
    ctx?: unknown;
  };
}

export const GroupDragAction: FC<IGroupDragActionProps> = ({
  isRoot,
  isLocked,
  parentField,
  parentFieldCanReorder,
  reordableNodesCnt,
  handleDraggerMouseDown,
  config,
}) => {
  let canRenderDrag = Boolean(
    config?.settings?.canReorder &&
    !isRoot &&
    (reordableNodesCnt ?? 0) > 1 &&
    !isLocked &&
    handleDraggerMouseDown,
  );

  if (parentField)
    canRenderDrag = canRenderDrag && Boolean(parentFieldCanReorder);

  if (!canRenderDrag)
    return null;

  const icon = config?.settings?.renderIcon?.({ type: 'drag' }, config?.ctx);

  return (
    <div className="sha-query-builder-group-extra-actions">
      <button
        type="button"
        className="sha-query-builder-group-extra-action qb-drag-handler group--drag-handler"
        onMouseDown={handleDraggerMouseDown as React.MouseEventHandler<HTMLButtonElement>}
        aria-label="Drag group"
      >
        {icon}
      </button>
    </div>
  );
};
