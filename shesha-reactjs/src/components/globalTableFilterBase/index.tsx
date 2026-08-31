import { FC, useEffect, useState } from 'react';
import * as React from 'react';
import Search from 'antd/lib/input/Search';
import { SearchProps } from 'antd/lib/input';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useDebouncedCallback } from 'use-debounce';
import { useStyles } from './styles/styles';

export interface IGlobalTableFilterBaseProps {
  searchProps?: SearchProps | undefined;
  changeQuickSearch: (val: string) => void;
  performQuickSearch?: ((val: string) => void) | undefined;
  quickSearch: string | undefined;
  size?: SizeType | undefined;
  style?: React.CSSProperties | undefined;
}

export const GlobalTableFilterBase: FC<IGlobalTableFilterBaseProps> = ({
  searchProps,
  changeQuickSearch,
  performQuickSearch,
  quickSearch,
  style,
}) => {
  const { styles } = useStyles();
  const srcProps: SearchProps = {
    allowClear: true,
    ...searchProps,
    size: searchProps?.size || 'small',
  };

  // Type into local state and push to the datatable store on a debounce: every store update
  // re-renders all table subscribers (every cell), which freezes typing on heavy tables.
  const [localValue, setLocalValue] = useState(quickSearch);
  useEffect(() => {
    setLocalValue(quickSearch);
  }, [quickSearch]);
  const debouncedChangeQuickSearch = useDebouncedCallback((value: string) => {
    changeQuickSearch(value);
  }, 400);

  const onSearch = (
    value: string,
    event?: | React.MouseEvent<HTMLElement, MouseEvent> | React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    event?.stopPropagation();
    event?.preventDefault();
    debouncedChangeQuickSearch.cancel();
    if (performQuickSearch) {
      performQuickSearch(value);
    }
  };

  return (
    <div className={styles.shaGlobalTableFilter} style={style}>
      <Search
        value={localValue}
        onKeyDown={(event) => event.stopPropagation()}
        onSearch={onSearch}
        onChange={(e) => {
          e.stopPropagation();
          setLocalValue(e.target.value);
          debouncedChangeQuickSearch(e.target.value);
        }}
        onClick={(event) => event.stopPropagation()}
        {...srcProps}
      />
    </div>
  );
};

export default GlobalTableFilterBase;
