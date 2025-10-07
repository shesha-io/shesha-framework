import { PlusOutlined } from '@ant-design/icons';
import { InputProps, Tag } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { Autocomplete } from '@/components/autocomplete';
import Show from '@/components/show';

export interface IAutocompleteTagGroupProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: string[];
  defaultValue?: string;
  autocompleteUrl: string;
  onChange?: (values?: string[]) => void;
}

interface IAutocompleteTagGroupState {
  inputVisible?: boolean;
  inputValue?: string;
}

export const AutocompleteTagGroup: FC<IAutocompleteTagGroupProps> =
    ({ value = [], onChange, defaultValue, autocompleteUrl, ...rest }) => {
      const [state, setState] = useState<IAutocompleteTagGroupState>({ inputVisible: false, inputValue: '' });

      const inputRef = React.useRef<any>(null);

      const handleClose = (removedTag): void => {
        const tags = value?.filter((tag) => tag !== removedTag);

        if (onChange) {
          onChange(tags);
        }
      };

      const showInput = (): void => {
        setState({ ...state, inputVisible: true });
      };

      useEffect(() => {
        if (state.inputVisible) {
          inputRef?.current?.focus({});
        }
      }, [state.inputVisible]);

      const handleInputChange = (selected: string): void => {
        let localValue = value;

        if (selected && localValue?.indexOf(selected) === -1) {
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
        const newTags = value?.filter((v) => v !== tag);
        const { inputValue: currentValue } = state;

        setState({
          inputVisible: true,
          inputValue: tag,
        });

        onChange(currentValue?.trim() ? [...newTags, currentValue] : newTags);
      };

      const forMap = (tag: string): JSX.Element => {
        const tagElem = (
          <>
            <Show when={!rest?.readOnly}>
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
            <Show when={rest?.readOnly}>
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
              defaultValue={defaultValue}
              size="small"
              value={inputValue}
              onChange={handleInputChange}
              readOnly={rest?.readOnly}
              allowClear={true}
              dataSourceType="url"
              dataSourceUrl={autocompleteUrl}
            />
          </Show>

          <Show when={!inputVisible && !rest?.readOnly}>
            <Tag onClick={showInput} className="site-tag-plus">
              <PlusOutlined /> New value
            </Tag>
          </Show>
        </>
      );
    };

export default AutocompleteTagGroup;
