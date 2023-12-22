import React, { FC } from 'react';
import { SearchProps } from 'antd/lib/input';
import GlobalTableFilterBase from '@/components/globalTableFilterBase';
import { useDataTable } from '@/providers';

export interface IGlobalTableFilterProps {
  searchProps?: SearchProps;
}

export const GlobalTableFilter: FC<IGlobalTableFilterProps> = ({ searchProps }) => {
  const { changeQuickSearch, quickSearch, performQuickSearch } = useDataTable();

  const srcProps: SearchProps = {
    size: 'small',
    allowClear: true,
    ...searchProps,
  };

  return <GlobalTableFilterBase {...{ srcProps, changeQuickSearch, performQuickSearch, quickSearch }} />;
};

export default GlobalTableFilter;
