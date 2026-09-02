import { IDimensionFieldSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { useMemo, useRef, useState } from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { App, AutoComplete } from 'antd';
import Icon from '@/components/icon/Icon';
import { useStyles } from '../styles';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { DIMENSION_VALUES, GRID_DIMENSION_VALUES } from '@/utils/style';
import { exceedsWidth } from '@/designer-components/_settings/utils/dimensions/bounds';
import { useCanvas } from '@/providers/canvas';

const convertOprtions = (options: string[]): { value: string }[] => options.map((item) => ({ value: item }));

/** Dimensions measured across the container, for which a percentage over 100% overflows it. */
const WIDTH_DIMENSIONS = ['width', 'minWidth', 'maxWidth'];

export const DimensionFieldWrapper: FCUnwrapped<IDimensionFieldSettingsInputProps> = (props) => {
  const { value, onChange, readOnly = false, width = '100%', tooltip, icon, label, size, dimensionType } = props;

  const { styles } = useStyles();
  const { message } = App.useApp();
  // Judged against the on-screen width the canvas covers, which zoom does not move. In "Canvas"
  // mode designerWidth is the zoom-derived layout width, so judging by it would shift the warning
  // threshold with the zoom level.
  const { designerWidth, deviceWidth, autoWidth } = useCanvas();

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

  // Only a value the user actually edited in this focus session is judged on blur: focusing a
  // field that already holds an over-wide width and clicking away must stay a no-op.
  const editedSinceFocus = useRef(false);

  /**
   * Warns when a committed width is wider than the canvas. Presentation-only: the value is stored
   * exactly as entered - the canvas bounds it visually at render time, nothing rewrites it here.
   */
  const warnIfExceedsCanvas = (data: string | undefined): void => {
    if (!WIDTH_DIMENSIONS.includes(dimensionType)) return;

    // exceedsWidth returns a boolean and so does not narrow `data`; guard the type first.
    if (typeof data !== 'string' || !exceedsWidth(data, autoWidth ? deviceWidth : designerWidth)) return;

    message.warning(`${data.trim()} is wider than the canvas, so the canvas displays it bounded. The value is kept as entered.`);
  };

  const handleChange = (data: string): void => {
    editedSinceFocus.current = true;
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

  const handleFocus = (): void => {
    editedSinceFocus.current = false;
    handleOnClick();
  };

  const handleBlur = (): void => {
    setOpen(false);
    if (editedSinceFocus.current) warnIfExceedsCanvas(value);
    editedSinceFocus.current = false;
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
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleOnClick}
      value={value ?? ''}
      allowClear
      suffix={suffix}
      open={open}
    />
  );
};
