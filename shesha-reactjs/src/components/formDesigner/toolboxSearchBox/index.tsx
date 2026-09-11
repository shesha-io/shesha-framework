import { FC } from 'react';
import * as React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { useStyles } from '../styles/styles';
import { SizeType } from 'antd/es/config-provider/SizeContext';

// Local so the icon stays themed wherever the search box is reused,
// not only inside the designer toolbox.
const useSearchBoxStyles = createStyles(({ css, token }) => ({
  searchIcon: css`
    color: ${token.colorTextPlaceholder};
  `,
}));

export interface ISearchBoxProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  size?: SizeType;
}

export const SearchBox: FC<ISearchBoxProps> = (props) => {
  const { styles } = useStyles();
  const { styles: searchBoxStyles } = useSearchBoxStyles();
  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>): void => {
    props.onChange(e.currentTarget.value);
  };

  return (
    <Input
      size={props.size || 'small'}
      className={styles.shaComponentSearch}
      placeholder={props.placeholder}
      allowClear={true}
      value={props.value}
      onChange={handleSearchChange}
      suffix={<SearchOutlined className={searchBoxStyles.searchIcon} />}
    />
  );
};

export default SearchBox;
