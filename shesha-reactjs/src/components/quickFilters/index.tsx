import React, { FC } from 'react';
import { Tag } from 'antd';
import { IQuickFilter } from '../../interfaces';
import { nanoid } from 'nanoid/non-secure';

export interface IQuickFiltersProps {
  quickFilters?: IQuickFilter[];
  toggleQuickFilter?: (value: string) => void;
}

export const QuickFilters: FC<IQuickFiltersProps> = ({ quickFilters = [], toggleQuickFilter }) => {
  const SelectedFilter = ({ id, name, selected }: IQuickFilter) => {
    const handleFilterClose = () => {
      if (toggleQuickFilter) {
        toggleQuickFilter(id);
      }
    };

    return (
      <Tag key={nanoid()} onClick={handleFilterClose} color={selected ? '#2db7f5' : undefined}>
        {name}
      </Tag>
    );
  };

  if (!quickFilters.length) return null;

  return (
    <div className="quick-filters">
      <span className="label">Quick filters</span>
      <>
        {quickFilters.map(filter => (
          <SelectedFilter key={nanoid()} {...filter} />
        ))}
      </>
    </div>
  );
};

export default QuickFilters;
