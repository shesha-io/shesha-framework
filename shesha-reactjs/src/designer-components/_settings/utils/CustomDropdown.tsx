import React, { FC, useState } from 'react';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Select, Space, Tooltip } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IDropdownOption } from '@/designer-components/_settings/utils/background/interfaces';

interface CustomDropdownProps {
  value: string;
  options: Array<string | IDropdownOption>;
  readOnly?: boolean;
  label?: string | React.ReactNode;
  size?: SizeType;
  defaultValue?: string;
  customTooltip?: string;
  onAddCustomOption?: (newOption: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  optionFilterProp?: string;
  style?: React.CSSProperties;
  popupMatchSelectWidth?: boolean;
  labelRender?: (props: any) => React.ReactNode;
}

const CustomDropdown: FC<CustomDropdownProps> = ({
  value,
  options,
  readOnly,
  label,
  placeholder,
  defaultValue,
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

  const clearInputs = () => {
    setCustomOption('');
  };

  const addCustomOption = () => {
    setCustomOptions(() => [...options, customOption]);
    clearInputs();
  };


  const renderCustomOptionInput = () => (
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

  return (
        <Select
          value={value}
          disabled={readOnly}
          size={size}
          onChange={onChange}
          defaultValue={defaultValue}
          placeholder={placeholder}
          labelRender={labelRender}
          style={style}
          optionFilterProp={optionFilterProp}
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
