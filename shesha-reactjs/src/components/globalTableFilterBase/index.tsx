import React, { FC } from 'react';
import Search from 'antd/lib/input/Search';
import { SearchProps } from 'antd/lib/input';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IGlobalTableFilterBaseProps {
  searchProps?: SearchProps;
  changeQuickSearch: (val: string) => void;
  performQuickSearch?: (val: string) => void;
  quickSearch: string;
  size?: SizeType;
}

export const GlobalTableFilterBase: FC<IGlobalTableFilterBaseProps> = ({
  searchProps,
  changeQuickSearch,
  performQuickSearch,
  quickSearch,
  size = 'small',
}) => {
  const srcProps: SearchProps = {
    size,
    allowClear: true,
    ...searchProps,
  };

  const onSearch = (
    value: string,
    event?:
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    event?.stopPropagation();
    if (performQuickSearch) {
      performQuickSearch(value);
    }
  };

  return (
    <div className="sha-global-table-filter">
      <Search
        value={quickSearch}
        onKeyPress={event => event?.stopPropagation()}
        onSearch={onSearch}
        onChange={e => {
          e?.stopPropagation();
          changeQuickSearch(e.target.value);
        }}
        onClick={event => event?.stopPropagation()}
        {...srcProps}
      />
    </div>
  );
};

export default GlobalTableFilterBase;
