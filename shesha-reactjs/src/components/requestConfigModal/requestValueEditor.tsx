import React, { FC, useMemo } from 'react';
import { Dropdown, Input, MenuProps, Tooltip } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { IPropertySetting } from '@/providers/form/models';
import { isPropertySettings } from '@/designer-components/_settings/utils';

const { TextArea } = Input;

export type RequestValue = string | IPropertySetting<string> | undefined;

type ValueMode = 'value' | 'code';

export interface IRequestValueEditorProps {
  value?: RequestValue;
  onChange: (value: RequestValue) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  textAreaStyle?: React.CSSProperties;
  readOnly?: boolean;
}

const toSetting = (value: RequestValue): IPropertySetting<string> => {
  if (isPropertySettings(value)) return value as IPropertySetting<string>;
  return { _mode: 'value', _code: undefined, _value: (value as string) ?? '' };
};

const emit = (
  next: IPropertySetting<string>,
  onChange: (v: RequestValue) => void,
): void => {
  if (next._mode === 'code' || next._code) {
    onChange(next);
  } else {
    onChange(next._value ?? '');
  }
};

export const RequestValueEditor: FC<IRequestValueEditorProps> = ({
  value,
  onChange,
  placeholder,
  multiline,
  rows = 3,
  textAreaStyle,
  readOnly,
}) => {
  const setting = useMemo(() => toSetting(value), [value]);
  const mode: ValueMode = setting._mode === 'code' ? 'code' : 'value';
  const displayValue = mode === 'code' ? (setting._code ?? '') : (setting._value ?? '');

  const onInlineChange = (newValue: string): void => {
    if (mode === 'code') {
      emit({ ...setting, _code: newValue }, onChange);
    } else {
      emit({ ...setting, _value: newValue }, onChange);
    }
  };

  const onPickSource = (next: ValueMode): void => {
    if (next === mode) return;
    emit({ ...setting, _mode: next }, onChange);
  };

  const menu: MenuProps = {
    selectable: true,
    selectedKeys: [mode],
    items: [
      { key: 'header', label: <span style={{ fontWeight: 600 }}>Select source</span>, disabled: true },
      { type: 'divider' as const },
      { key: 'value', label: 'Value' },
      { key: 'code', label: 'Function (mustache)' },
    ],
    onClick: ({ key }) => {
      if (key === 'value' || key === 'code') onPickSource(key);
    },
  };

  const sourceDots = (
    <Dropdown menu={menu} trigger={['click']} placement="bottomRight" disabled={readOnly}>
      <Tooltip title="Select source">
        <MoreOutlined
          style={{ cursor: readOnly ? 'not-allowed' : 'pointer', color: mode === 'code' ? '#1677ff' : undefined }}
          onClick={(e) => e.stopPropagation()}
        />
      </Tooltip>
    </Dropdown>
  );

  const inputStyle: React.CSSProperties = mode === 'code'
    ? { fontFamily: 'monospace', fontSize: 13, ...textAreaStyle }
    : textAreaStyle ?? {};

  const effectivePlaceholder = mode === 'code' ? '{{data.x}}' : placeholder;

  if (multiline) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <TextArea
          value={displayValue}
          placeholder={effectivePlaceholder}
          rows={rows}
          style={{ ...inputStyle, paddingRight: 28 }}
          disabled={readOnly}
          onChange={(e) => onInlineChange(e.target.value)}
        />
        <div style={{ position: 'absolute', top: 6, right: 8 }}>
          {sourceDots}
        </div>
      </div>
    );
  }

  return (
    <Input
      value={displayValue}
      placeholder={effectivePlaceholder}
      style={inputStyle}
      disabled={readOnly}
      onChange={(e) => onInlineChange(e.target.value)}
      suffix={sourceDots}
    />
  );
};
