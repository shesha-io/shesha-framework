import React, { FC } from 'react';
import Search from 'antd/lib/input/Search';
import { SearchProps } from 'antd/lib/input';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useStyles } from './styles/styles';

export interface IGlobalTableFilterBaseProps {
  searchProps?: SearchProps;
  changeQuickSearch: (val: string) => void;
  performQuickSearch?: (val: string) => void;
  quickSearch: string;
  size?: SizeType;
  block?: boolean;
  style?: React.CSSProperties;
}

export const GlobalTableFilterBase: FC<IGlobalTableFilterBaseProps> = ({
  searchProps,
  changeQuickSearch,
  performQuickSearch,
  quickSearch,
  block = false,
  style,
}) => {
  const { styles } = useStyles({ block });
  const srcProps: SearchProps = {
    allowClear: true,
    ...searchProps,
    size: searchProps?.size || 'small',
  };

  const onSearch = (
    value: string,
    event?:
      | React.MouseEvent<HTMLElement, MouseEvent> |
      React.ChangeEvent<HTMLInputElement> |
      React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    event?.stopPropagation();
    event?.preventDefault();
    if (performQuickSearch) {
      performQuickSearch(value);
    }
  };

  return (
    <div className={styles.shaGlobalTableFilter} style={style}>
      <Search
        value={quickSearch}
        onKeyPress={(event) => event?.stopPropagation()}
        onSearch={onSearch}
        onChange={(e) => {
          e?.stopPropagation();
          changeQuickSearch(e.target.value);
        }}
        onClick={(event) => event?.stopPropagation()}
        {...srcProps}
      />
    </div>
  );
};

export default GlobalTableFilterBase;
