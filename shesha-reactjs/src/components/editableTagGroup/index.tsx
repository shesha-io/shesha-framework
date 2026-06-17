import { PlusOutlined } from '@ant-design/icons';
import { Input, InputProps, Tag, type InputRef } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import Show from '@/components/show';
import { isDefined } from '@/utils/nullables';

export interface IEditableTagGroupProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: string[] | undefined;
  onChange?: ((values: string[] | null) => void) | undefined;
}

interface IEditableTagGroupState {
  inputVisible?: boolean;
  inputValue?: string;
}

export const EditableTagGroup: FC<IEditableTagGroupProps> = ({ value = [], onChange, readOnly = false, ...rest }) => {
  const [state, setState] = useState<IEditableTagGroupState>({ inputVisible: false, inputValue: '' });

  const inputRef = React.useRef<InputRef>(null);

  const handleClose = (removedTag: string): void => {
    const tags = value.filter((tag) => tag !== removedTag);

    if (onChange) {
      onChange(tags);
    }
  };

  const showInput = (): void => {
    setState({ ...state, inputVisible: true });
  };

  useEffect(() => {
    if (state.inputVisible) {
      inputRef.current?.focus({});
    }
  }, [state.inputVisible]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setState({ ...state, inputValue: e.target.value });
  };

  const handleInputConfirm = (): void => {
    const { inputValue: currentValue } = state;

    let localValue = value;

    if (currentValue && localValue.indexOf(currentValue) === -1) {
      localValue = [...localValue, currentValue];

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

    onChange?.(currentValue?.trim() ? [...newTags, currentValue] : newTags);
  };

  const forMap = (tag: string): React.JSX.Element => {
    const tagElem = (
      <Tag
        closable={!readOnly}
        onClose={(e) => {
          e.preventDefault();
          handleClose(tag);
        }}
        onClick={(e) => {
          e.preventDefault();
          if (!readOnly)
            onTagEdit(tag);
        }}
      >
        {tag}
      </Tag>
    );
    return (
      <span key={tag} style={{ display: 'inline-block' }}>
        {tagElem}
      </span>
    );
  };

  const { inputVisible, inputValue } = state;
  const tagChild = (Array.isArray(value) ? value : isDefined(value) ? [value] : []).map(forMap);

  return (
    <>
      <div style={{ marginBottom: value.length ? 16 : 0 }}>
        {tagChild}
      </div>

      <Show when={inputVisible ?? false}>
        <Input
          type="text"
          size="small"
          style={{ width: '100%' }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
          allowClear
          {...rest}
          ref={inputRef}
        />
      </Show>

      <Show when={!inputVisible && !readOnly}>
        <Tag onClick={showInput} className="site-tag-plus">
          <PlusOutlined /> New Value
        </Tag>
      </Show>
    </>
  );
};

export default EditableTagGroup;
