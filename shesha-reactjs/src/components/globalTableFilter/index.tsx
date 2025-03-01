import React, { FC } from 'react';
import { SearchProps } from 'antd/lib/input';
import GlobalTableFilterBase from '@/components/globalTableFilterBase';
import { useDataTable } from '@/providers';

export interface IGlobalTableFilterProps {
  searchProps?: SearchProps;
  block?: boolean;
  style?: React.CSSProperties;
}

export const GlobalTableFilter: FC<IGlobalTableFilterProps> = ({ searchProps, block, style }) => {
  const { changeQuickSearch, quickSearch, performQuickSearch } = useDataTable();

  const srcProps: SearchProps = {
    allowClear: true,
    ...searchProps,
  };

  return <GlobalTableFilterBase style={style} {...{ searchProps: srcProps, changeQuickSearch, performQuickSearch, quickSearch, block }} />;
};

export default GlobalTableFilter;
