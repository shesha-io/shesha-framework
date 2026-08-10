import { IDimensionFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { useMemo, useState } from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { AutoComplete } from 'antd';
import Icon from '@/components/icon/Icon';
import { useStyles } from '../styles';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { DIMENSION_VALUES, GRID_DIMENSION_VALUES } from '@/utils/style';

const convertOprtions = (options: string[]): { value: string }[] => options.map((item) => ({ value: item }));

export const DimensionFieldWrapper: FCUnwrapped<IDimensionFieldSettingsInputProps> = (props) => {
  const { value, onChange, readOnly = false, width = '100%', tooltip, icon, label, size, dimensionType } = props;

  const { styles } = useStyles();

  const allOptions = useMemo (() => {
    return ['gridRowHeight', 'gridColumnWidth'].includes(dimensionType) ? GRID_DIMENSION_VALUES : DIMENSION_VALUES;
  }, [dimensionType]);

  const [options, setOptions] = useState(() => convertOprtions(allOptions));
  const [open, setOpen] = useState(false);

  const suffix = useMemo(() => {
    return isDefined(icon) &&
      <Icon style={{ color: 'black' }} icon={icon} hint={isDefined(tooltip) ? tooltip : (typeof label === 'string' ? label : undefined)} className={styles.icon} />;
  }, [icon, tooltip, label, styles.icon]);

  const handleSearch = (searchText: string): void => {
    if (isNullOrWhiteSpace(searchText)) {
      setOptions(convertOprtions(allOptions));
      return;
    }
    const filtered = allOptions.filter((item) => item.toLowerCase().includes(searchText.toLowerCase()));
    setOptions(convertOprtions(filtered));
  };

  const handleChange = (data: string): void => {
    onChange?.(data);
  };

  const handleSelect = (data: string): void => {
    onChange?.(data);
    setOpen(false);
    handleSearch('');
  };

  const handleOnClick = (): void => {
    handleSearch('');
    setOpen(true);
  };

  return (
    <AutoComplete
      size={size}
      disabled={readOnly}
      options={options}
      style={{ width }}
      showSearch={{
        onSearch: handleSearch,
        searchValue: ' ',
      }}
      onSelect={handleSelect}
      onChange={handleChange}
      onFocus={handleOnClick}
      onBlur={() => setOpen(false)}
      onClick={handleOnClick}
      value={value ?? ''}
      allowClear
      suffix={suffix}
      open={open}
    />
  );
};
