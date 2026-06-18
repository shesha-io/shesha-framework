import { PlusOutlined } from '@ant-design/icons';
import { InputProps, Tag } from 'antd';
import React, { FC, useState } from 'react';
import { Autocomplete } from '@/components/autocomplete';
import Show from '@/components/show';

export interface IAutocompleteTagGroupProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: string[] | null | undefined;
  defaultValue?: string;
  autocompleteUrl: string;
  onChange?: (values: string[] | null) => void;
}

interface IAutocompleteTagGroupState {
  inputVisible: boolean;
  inputValue: string;
}

export const AutocompleteTagGroup: FC<IAutocompleteTagGroupProps> =
  ({ value: nullableValue, onChange, defaultValue, autocompleteUrl, ...rest }) => {
    const value = nullableValue ?? [];
    const [state, setState] = useState<IAutocompleteTagGroupState>({ inputVisible: false, inputValue: '' });

    const handleClose = (removedTag: string): void => {
      const tags = value.filter((tag) => tag !== removedTag);

      if (onChange) {
        onChange(tags);
      }
    };

    const showInput = (): void => {
      setState({ ...state, inputVisible: true });
    };

    const handleInputChange = (selected: string | string[] | null): void => {
      if (Array.isArray(selected))
        return;

      let localValue = value;

      if (selected && localValue.indexOf(selected) === -1) {
        localValue = [...localValue, selected];

        if (onChange) {
          onChange(localValue);
        }
      }

      setState({
        inputVisible: false,
        inputValue: '',
      });
    };

    const onTagEdit = (tag: string): void => {
      const newTags = value.filter((v) => v !== tag);
      const { inputValue: currentValue } = state;

      setState({
        inputVisible: true,
        inputValue: tag,
      });

      onChange?.(currentValue.trim() ? [...newTags, currentValue] : newTags);
    };

    const forMap = (tag: string): React.JSX.Element => {
      const tagElem = (
        <>
          <Show when={!rest.readOnly}>
            <Tag
              closable
              onClose={(e) => {
                e.preventDefault();
                handleClose(tag);
              }}
              onClick={(e) => {
                e.preventDefault();
                onTagEdit(tag);
              }}
            >
              {tag}
            </Tag>
          </Show>
          <Show when={rest.readOnly ?? false}>
            <Tag>{tag}</Tag>
          </Show>
        </>
      );
      return (
        <span key={tag} style={{ display: 'inline-block' }}>
          {tagElem}
        </span>
      );
    };

    const { inputVisible, inputValue } = state;
    const tagChild = Boolean(value) ? value.map(forMap) : null;

    return (
      <>
        <div style={{ marginBottom: 16 }}>
          {tagChild}
        </div>

        <Show when={inputVisible}>
          <Autocomplete.Raw
            size="small"
            value={inputValue}
            onChange={handleInputChange}
            readOnly={rest.readOnly}
            allowClear={true}
            dataSourceType="url"
            dataSourceUrl={autocompleteUrl}
          />
        </Show>

        <Show when={!inputVisible && !rest.readOnly}>
          <Tag onClick={showInput} className="site-tag-plus">
            <PlusOutlined /> New value
          </Tag>
        </Show>
      </>
    );
  };

export default AutocompleteTagGroup;
