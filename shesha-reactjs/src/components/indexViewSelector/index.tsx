import React, { FC } from 'react';
import { useDataTable } from '../../providers';
import IndexViewSelectorRenderer from '../indexViewSelectorRenderer';

export interface IIndexViewSelectorProps {
  /**
   * @deprecated pass this on an `IndexTableProvider` level
   */
  header?: string;
}

export const IndexViewSelector: FC<IIndexViewSelectorProps> = ({ header }) => {
  const {
    title,
    changeSelectedStoredFilterIds,
    predefinedFilters,
    selectedStoredFilterIds,
  } = useDataTable();

  const changeSelectedFilter = (id: string) => {
    changeSelectedStoredFilterIds(id ? [id] : []);
  };

  const allFilters = [...(predefinedFilters || [])];

  return (
    <IndexViewSelectorRenderer
      header={header || title}
      filters={allFilters}
      onSelectFilter={changeSelectedFilter}
      selectedFilterId={
        selectedStoredFilterIds && selectedStoredFilterIds.length > 0 ? selectedStoredFilterIds[0] : null
      }
    />
  );
};

export default IndexViewSelector;
