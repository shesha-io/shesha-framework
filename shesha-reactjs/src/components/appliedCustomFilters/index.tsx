import React, { FC } from 'react';
import { Tag } from 'antd';
import { ICustomFilterOptions } from '@/providers/dataTable/interfaces';

export interface IAppliedCustomFiltersProps {
  appliedCustomFilterOptions?: ICustomFilterOptions[];
}

export const AppliedCustomFilters: FC<IAppliedCustomFiltersProps> = ({ appliedCustomFilterOptions = [] }) => {
  if (!appliedCustomFilterOptions.length) return null;

  return (
    <div className="applied-custom-filters">
      <span className="label">Filtered by: </span>
      {appliedCustomFilterOptions.map(({ id, name }) => (
        <Tag key={id}>{name}</Tag>
      ))}
    </div>
  );
};

export default AppliedCustomFilters;
