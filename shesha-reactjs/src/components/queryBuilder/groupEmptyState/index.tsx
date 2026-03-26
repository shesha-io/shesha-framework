import React, { FC } from 'react';
import QueryRuleElement from './queryRuleElement';

interface IGroupEmptyStateProps {
  isRoot?: boolean;
  children1?: {
    size?: number;
  } | null;
  addRule?: () => void;
  addGroup?: () => void;
  config?: {
    settings?: {
      immutableGroupsMode?: boolean;
    };
  };
}

export const GroupEmptyState: FC<IGroupEmptyStateProps> = ({
  isRoot,
  children1,
  addRule,
  addGroup,
  config,
}) => {
  const isEmpty = (children1?.size ?? 0) === 0;
  const isReadOnly = Boolean(config?.settings?.immutableGroupsMode);

  if (isEmpty) {
    return (
      <div
        className={`sha-query-builder-empty-state${isRoot ? ' sha-query-builder-empty-state--root' : ''}`}
      >
        {isRoot && !isReadOnly ? (
          <QueryRuleElement onAddRule={addRule} onAddGroup={addGroup} />
        ) : (
          <div className="sha-query-builder-empty-state-message">
            No filter conditions are applied
          </div>
        )}
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
