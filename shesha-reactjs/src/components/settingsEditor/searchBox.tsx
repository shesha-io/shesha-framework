import { FC } from 'react';
import * as React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { useStyles } from './styles/styles';

export interface ISearchBoxProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const useSearchBoxStyles = createStyles(({ css, token }) => ({
  searchIcon: css`
    color: ${token.colorTextPlaceholder};
  `,
}));

export const SearchBox: FC<ISearchBoxProps> = (props) => {
  const { styles } = useStyles();
  const { styles: searchBoxStyles } = useSearchBoxStyles();
  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>): void => {
    props.onChange(e.currentTarget.value);
  };

  return (
    <Input
      className={styles.shaSettingSearch}
      placeholder={props.placeholder}
      allowClear={true}
      value={props.value}
      onChange={handleSearchChange}
      suffix={<SearchOutlined className={searchBoxStyles.searchIcon} />}
    />
  );
};

export default SearchBox;
