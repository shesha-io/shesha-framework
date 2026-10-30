import { IDropdownOption, IDropdownSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import * as React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { isDefined } from '@/utils/nullables';
import Icon from '@/components/icon/Icon';
import { useStyles } from './dropDownStyles';
import { ensureOptionFontsLoaded } from '@/designer-components/_settings/utils/font/webFonts';

const renderOptionLabel = (option: IDropdownOption, optionLabelClassName: string): React.ReactNode => {
  if (!isDefined(option.icon))
    return isDefined(option.style) ? <span style={option.style}>{option.label}</span> : option.label;
  return (
    <span className={optionLabelClassName} style={option.style}>
      <Icon icon={option.icon} />
      {option.label}
    </span>
  );
};

export const DropDownWrapper: FCUnwrapped<IDropdownSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, width, dropdownOptions, dropdownMode, allowClear, variant, className, showSearch, placeholder } = props;
  const { styles } = useStyles();
  const sourceOptions = React.useMemo(() => Array.isArray(dropdownOptions) ? dropdownOptions : [], [dropdownOptions]);
  const options: DefaultOptionType[] = sourceOptions
    .map((option) => ({ value: option.value, label: renderOptionLabel(option, styles.optionLabel) }));

  // Options shown in their own font (a font picker) need that font loaded: the selected one now, the rest when the list opens.
  React.useEffect(() => {
    ensureOptionFontsLoaded(sourceOptions.filter((option) => option.value === value));
  }, [sourceOptions, value]);

  return (
    <Select
      value={value}
      {...(onChange ? { onChange } : {})}
      disabled={readOnly ?? false}
      size={size}
      {...(dropdownMode ? { mode: dropdownMode } : {})}
      allowClear={allowClear ?? true}
      {...(variant ? { variant } : {})}
      {...(className ? { className } : {})}
      showSearch={showSearch ?? false}
      style={{ width: width ?? "100%" }}
      placeholder={placeholder}
      options={options}
      onOpenChange={(open) => {
        if (open) ensureOptionFontsLoaded(sourceOptions);
      }}
    />
  );
};
