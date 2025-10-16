import React, { FC } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { useStyles } from '../styles/styles';
import { SizeType } from 'antd/es/config-provider/SizeContext';

export interface ISearchBoxProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  size?: SizeType;
}

export const SearchBox: FC<ISearchBoxProps> = (props) => {
  const { styles } = useStyles();
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
      suffix={
        <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
      }
    />
  );
};

export default SearchBox;
