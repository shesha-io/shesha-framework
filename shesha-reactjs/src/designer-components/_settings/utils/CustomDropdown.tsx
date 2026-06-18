import React, { FC, useState } from 'react';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Select, SelectProps, Space, Tooltip } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IDropdownOption } from '@/designer-components/_settings/utils/background/interfaces';
import { isNullOrWhiteSpace } from '@/utils/nullables';

interface CustomDropdownProps {
  value: string;
  options: Array<string | IDropdownOption>;
  readOnly?: boolean | undefined;
  label?: string | React.ReactNode;
  size?: SizeType | undefined;
  customTooltip?: string | undefined;
  onAddCustomOption?: ((newOption: string) => void) | undefined;
  onChange?: ((value: string) => void) | undefined;
  placeholder?: string | undefined;
  optionFilterProp?: string | undefined;
  style?: React.CSSProperties | undefined;
  popupMatchSelectWidth?: boolean | undefined;
  labelRender?: SelectProps["labelRender"] | undefined;
}

const CustomDropdown: FC<CustomDropdownProps> = ({
  value,
  options,
  readOnly,
  label,
  placeholder,
  optionFilterProp,
  customTooltip,
  onChange,
  size,
  labelRender,
  popupMatchSelectWidth = true,
  style,
}) => {
  const [customOption, setCustomOption] = useState('');
  const [customOptions, setCustomOptions] = useState(options);

  const clearInputs = (): void => {
    setCustomOption('');
  };

  const addCustomOption = (): void => {
    setCustomOptions(() => [...options, customOption]);
    clearInputs();
  };


  const renderCustomOptionInput = (): React.JSX.Element => (
    <>
      <Divider style={{ margin: '8px 0' }} />
      <Space style={{ padding: '0 8px 4px' }} onClick={(e) => e.stopPropagation()}>
        <Space.Compact size="large">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', width: '100%' }}>

            <div>
              <Space style={{ display: 'flex', flexDirection: 'row' }}>
                <Input
                  readOnly={readOnly}
                  value={customOption}
                  onChange={(e) => setCustomOption(e.target.value)}
                  size="small"
                  prefix={(
                    <Tooltip title={customTooltip} placement="top">
                      <QuestionCircleOutlined style={{ marginLeft: '2px', color: '#00000073' }} />
                    </Tooltip>
                  )}
                  onClick={(e) => e.stopPropagation()}
                />
              </Space>
            </div>
          </div>
        </Space.Compact>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={addCustomOption}
          disabled={readOnly || !customOption}
          style={{ width: 70, padding: '0 8px' }}
        >
          Apply {label}
        </Button>
      </Space>
    </>
  );

  const optionalProps: Partial<SelectProps> = {
  };
  if (labelRender)
    optionalProps.labelRender = labelRender;
  if (style)
    optionalProps.style = style;

  return (
    <Select<string>
      value={value}
      disabled={readOnly ?? false}
      size={size}
      onChange={(value) => {
        onChange?.(value);
      }}
      placeholder={placeholder}
      {...optionalProps}
      showSearch={!isNullOrWhiteSpace(optionFilterProp) ? { optionFilterProp } : false}
      popupMatchSelectWidth={popupMatchSelectWidth}
      popupRender={(menu) => (
        <>
          {menu}
          {renderCustomOptionInput()}
        </>
      )}
      options={customOptions.map((item) => typeof item === 'string' ? { label: item, value: item } : item)}
    />
  );
};

export default CustomDropdown;
