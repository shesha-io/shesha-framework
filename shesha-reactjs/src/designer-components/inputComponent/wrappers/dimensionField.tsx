import { IDimensionFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { useMemo, useState } from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { App, AutoComplete } from 'antd';
import Icon from '@/components/icon/Icon';
import { useStyles } from '../styles';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { DIMENSION_VALUES, GRID_DIMENSION_VALUES } from '@/utils/style';
import { MAX_DIMENSION_PERCENT, boundWidthPercent, exceedsWidthPercent } from '@/designer-components/_settings/utils/dimensions/utils';

const convertOprtions = (options: string[]): { value: string }[] => options.map((item) => ({ value: item }));

/** Dimensions measured across the container, for which a percentage over 100% overflows it. */
const WIDTH_DIMENSIONS = ['width', 'minWidth', 'maxWidth'];

export const DimensionFieldWrapper: FCUnwrapped<IDimensionFieldSettingsInputProps> = (props) => {
  const { value, onChange, readOnly = false, width = '100%', tooltip, icon, label, size, dimensionType } = props;

  const { styles } = useStyles();
  const { message } = App.useApp();

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

  /**
   * Overrides a percentage wider than the container and says so.
   *
   * Applied when the value is committed rather than on every keystroke: bounding as the user types
   * would rewrite "150" to "100" before they had finished typing, and they could never reach a value
   * whose prefix is over the bound.
   */
  const commit = (data: string | undefined): void => {
    if (!WIDTH_DIMENSIONS.includes(dimensionType)) return;

    // exceedsWidthPercent returns a boolean and so does not narrow `data`; guard the type first.
    if (typeof data !== 'string' || !exceedsWidthPercent(data)) return;

    // boundWidthPercent is typed string | number because it passes non-string values straight
    // through. A string in always yields a string out, but narrow rather than assert so the
    // contract is checked here instead of assumed.
    const bounded = boundWidthPercent(data);
    if (typeof bounded !== 'string') return;

    message.warning(`${data.trim()} is wider than the space the component sits in. Applied ${MAX_DIMENSION_PERCENT}% instead, which is the maximum.`);
    onChange?.(bounded);
  };

  const handleChange = (data: string): void => {
    onChange?.(data);
  };

  const handleSelect = (data: string): void => {
    onChange?.(data);
    setOpen(false);
    handleSearch('');
    commit(data);
  };

  const handleOnClick = (): void => {
    handleSearch('');
    setOpen(true);
  };

  const handleBlur = (): void => {
    setOpen(false);
    commit(value);
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
      onBlur={handleBlur}
      onClick={handleOnClick}
      value={value ?? ''}
      allowClear
      suffix={suffix}
      open={open}
    />
  );
};
