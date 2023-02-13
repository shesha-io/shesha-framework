import React, { FC } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';

export interface ISearchBoxProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}

export const SearchBox: FC<ISearchBoxProps> = (props) => {

    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        props.onChange(e.currentTarget.value);
    }

    return (
        <Input
            className='sha-component-search'
            placeholder={props.placeholder}
            allowClear={true}
            value={props.value}
            onChange={handleSearchChange}
            suffix={
                <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            }
        />
    );
}

export default SearchBox;