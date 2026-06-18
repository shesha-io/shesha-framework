import React, { FC } from 'react';
import { SearchProps } from 'antd/lib/input';
import GlobalTableFilterBase from '@/components/globalTableFilterBase';
import { useDataTableStore } from '@/providers';

export interface IGlobalTableFilterProps {
  searchProps?: SearchProps | undefined;
  block?: boolean | undefined;
  style?: React.CSSProperties | undefined;
}

export const GlobalTableFilter: FC<IGlobalTableFilterProps> = ({ searchProps, block, style }) => {
  const { changeQuickSearch, quickSearch, performQuickSearch } = useDataTableStore();

  const srcProps: SearchProps = {
    allowClear: true,
    ...searchProps,
  };

  return (
    <GlobalTableFilterBase
      style={style}
      searchProps={srcProps}
      changeQuickSearch={changeQuickSearch}
      performQuickSearch={performQuickSearch}
      quickSearch={quickSearch}
      block={block}
    />
  );
};

export default GlobalTableFilter;
