import { PlusOutlined } from '@ant-design/icons';
import { InputProps, Tag } from 'antd';
import React, { FC, useEffect, useState } from 'react'; 
import Autocomplete from '../autocomplete';
import Show from '../show';

export interface IAutocompleteTagGroupProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: string[];
  defaultValue?: string;
  autocompleteUrl: string;
  onChange?: (values?: string[]) => void;
  /**
  * Whether this control is disabled
  */
  disabled?: boolean;
  /**
  * If true, the automplete will be in read-only mode. This is not the same sa disabled mode
  */
  readOnly?: boolean;
}

interface IAutocompleteTagGroupState {
  inputVisible?: boolean;
  inputValue?: string;
}

export const AutocompleteTagGroup: FC<IAutocompleteTagGroupProps> = 
    ({ value = [], onChange, defaultValue, autocompleteUrl, ...rest }) => {
  const [state, setState] = useState<IAutocompleteTagGroupState>({ inputVisible: false, inputValue: '' });

  const inputRef = React.useRef<any>(null);

  const handleClose = removedTag => {
    const tags = value?.filter(tag => tag !== removedTag);

    if (onChange) {
      onChange(tags);
    }
  };

  const showInput = () => {
    setState({ ...state, inputVisible: true });
  };

  useEffect(() => {
    if (state.inputVisible) {
      inputRef?.current?.focus({});
    }
  }, [state.inputVisible]);

  const handleInputChange = (selected: string) => {
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

  const onTagEdit = (tag: string) => {
    const newTags = value?.filter(v => v !== tag);
    const { inputValue: currentValue } = state;

    setState({
      inputVisible: true,
      inputValue: tag,
    });

    onChange(currentValue?.trim() ? [...newTags, currentValue] : newTags);
  };

  const forMap = (tag: string) => {
    const tagElem = (
      <>
        <Show when={!rest?.readOnly && !rest?.disabled}>
          <Tag
            closable
            onClose={e => {
              e.preventDefault();
              handleClose(tag);
            }}
            onClick={e => {
              e.preventDefault();
              onTagEdit(tag);
            }}
          >
            {tag}
          </Tag>
        </Show>
        <Show when={rest?.readOnly || rest?.disabled}>
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
          style={{ width: '100%' }}
          value={inputValue}
          onChange={handleInputChange}
          readOnly={rest?.readOnly}
          disabled={rest?.disabled}
          allowClear={true}
          dataSourceType='url'
          dataSourceUrl={autocompleteUrl}
        />
      </Show>

      <Show when={!inputVisible && !rest?.disabled && !rest?.readOnly}>
        <Tag onClick={showInput} className="site-tag-plus">
          <PlusOutlined /> New value
        </Tag>
      </Show>
    </>
  )
}

export default AutocompleteTagGroup;
