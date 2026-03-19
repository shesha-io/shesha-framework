import React, { FC } from 'react';

interface IGroupEmptyStateProps {
  isRoot?: boolean;
  children1?: {
    size?: number;
  } | null;
}

export const GroupEmptyState: FC<IGroupEmptyStateProps> = ({ isRoot, children1 }) => {
  const isEmpty = (children1?.size ?? 0) === 0;

  if (isEmpty) {
    return (
      <div
        className={`sha-query-builder-empty-state${isRoot ? ' sha-query-builder-empty-state--root' : ''}`}
      >
        <div className="sha-query-builder-empty-state-message">
          No filter conditions are applied
        </div>
      </div>
    );
  }

  if (!isRoot) {
    return (
      <div className="sha-query-builder-group-footer-logic">
        Any of the following are true...
      </div>
    );
  }

  return null;
};
