import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon';
import { FilledIconTypes, FILLED_ICON_GROUPS } from './iconNamesFilled';
import ShaIcon from '@/components/shaIcon';
import { Button, Input, Radio, RadioChangeEvent, Modal } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { OutlinedIconTypes, OUTLINED_ICON_GROUPS } from './iconNamesOutlined';
import SectionSeparator from '@/components/sectionSeparator';
import { TwoToneIconTypes, TWO_FACED_ICON_GROUPS } from './iconNamesTwoTone';
import { humanizeString } from '@/utils/string';
import classNames from 'classnames';
import { useStyles } from './styles/styles';

export type ShaIconTypes = FilledIconTypes | OutlinedIconTypes | TwoToneIconTypes;
type IconModes = 'outlined' | 'filled' | 'twoFaced';

interface IIconMode {
  label: string;
  value: IconModes;
  icon?: ShaIconTypes;
}

const ICON_MODE_OPTIONS: IIconMode[] = [
  { label: 'Outlined', value: 'outlined', icon: 'BorderOutlined' },
  { label: 'Filled', value: 'filled' },
  { label: 'Two Faced', value: 'twoFaced' },
];

const ICON_MODE_GROUPS = {
  filled: FILLED_ICON_GROUPS,
  outlined: OUTLINED_ICON_GROUPS,
  twoFaced: TWO_FACED_ICON_GROUPS,
};

export interface IIconPickerProps extends IconBaseProps {
  /** The icon name */
  value?: any;

  /** A callback for when the icon changes */
  onIconChange?: (icon: ReactNode, iconName: ShaIconTypes) => void;

  /** The size of the select button */
  selectBtnSize?: SizeType;

  /** if true, indicates that the picker is readonly */
  readOnly?: boolean;

  twoToneColor?: string;

  iconSize?: number;

  defaultValue?: ShaIconTypes;
}

interface IOption {
  mode: IconModes;
  group: typeof FILLED_ICON_GROUPS | typeof OUTLINED_ICON_GROUPS | typeof TWO_FACED_ICON_GROUPS;
}

/**
 * A component for selecting icons, usually for form
 */
const IconPicker: FC<IIconPickerProps> = ({
  selectBtnSize = 'middle',
  value,
  onIconChange,
  readOnly = false,
  defaultValue,
  iconSize,
  ...props
}) => {
  const { styles } = useStyles();
  const [localSelectedIcon, setLocalSelectedIcon] = useState<ShaIconTypes>(defaultValue);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOption, setSearchOption] = useState<IOption>({
    mode: 'outlined',
    group: ICON_MODE_GROUPS['outlined'],
  });

  useEffect(() => {
    setLocalSelectedIcon(typeof value === 'object' ? value?.props?.iconName : value || defaultValue);
    onIconChange(<ShaIcon iconName={defaultValue} style={{ fontSize: 30 }} {...props} />, defaultValue);
  }, [defaultValue, value]);

  const toggleModalVisibility = () => {
    if (!readOnly) setShowModal((visible) => !visible);
  };

  const changeIconModes = (e: RadioChangeEvent) => {
    const mode = e.target.value as IconModes;

    setSearchOption({ mode, group: ICON_MODE_GROUPS[mode] });
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event?.target?.value);

  const handleIconSelection = (selected: ShaIconTypes) => {
    if (readOnly) return;
    setLocalSelectedIcon(selected);
    toggleModalVisibility();

    if (onIconChange) {
      onIconChange(<ShaIcon iconName={selected} style={{ fontSize: 30 }} {...props} />, selected);
    }
  };

  const onClear = () => {
    if (readOnly) return;
    setLocalSelectedIcon(null);
    toggleModalVisibility();

    if (onIconChange) {
      onIconChange(null, null);
    }
  };

  const memoizedActiveGroup = useMemo(() => {
    if (searchQuery) {
      const activeGroup = searchOption?.group;
      const filteredGroup = {};
      const objectKeys = Object.keys(activeGroup);

      for (const key of objectKeys) {
        filteredGroup[key] = activeGroup[key].filter((groupItem: string) =>
          groupItem?.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
      }
      return filteredGroup;
    } else {
      return searchOption?.group;
    }
  }, [searchQuery, searchOption?.group]);

  return (
    <div className={styles.shaIconPicker}>
      <div>
        <div
          onClick={toggleModalVisibility}
          style={{ pointerEvents: readOnly ? 'none' : 'all' }}
          className={classNames(styles.shaIconPickerSelectedIcon, { 'sha-readonly': readOnly })}
        >
          {localSelectedIcon ? (
            <Button
              size={selectBtnSize}
              className={styles.shaIconPicker}
              type='text'
              icon={<ShaIcon
                className={styles.shaIconPicker}
                iconName={localSelectedIcon}
                {...props}
                style={{ fontSize: iconSize || 24 }}
                name={localSelectedIcon}
              //title={localSelectedIcon} removed to avoid it conflicting with icon tooltip
              />}
            />
          ) : (
            <Button
              size={selectBtnSize}
              title={'Select icon'}
              disabled={readOnly}
              icon={<SelectOutlined style={{ margin: 0 }} size={iconSize || 24} />}
            ></Button>
          )}
        </div>
      </div>
      <Modal
        onCancel={toggleModalVisibility}
        onOk={toggleModalVisibility}
        open={showModal}
        width={950}
        title="Select Icon"
        footer={
          <div>
            <Button onClick={onClear} type="primary" danger>
              Clear
            </Button>
            <Button onClick={toggleModalVisibility}>Cancel</Button>
          </div>
        }
        className={styles.shaIconPickerModal}
      >
        <div className={styles.shaIconPickerSearch}>
          <Radio.Group
            options={ICON_MODE_OPTIONS}
            value={searchOption?.mode}
            onChange={changeIconModes}
            optionType="button"
          />
          <div className={styles.shaIconPickerSearchInputContainer}>
            <Input.Search allowClear onChange={onSearchChange} value={searchQuery} />
          </div>
        </div>
        <div className={styles.shaIconPickerIconList}>
          {Object.keys(memoizedActiveGroup).map((groupKey) => (
            <div className={styles.shaIconPickerIconListGroup} key={groupKey}>
              {memoizedActiveGroup[groupKey]?.length ? (
                <div className={styles.shaIconPickerIconListGroupHeader}>
                  <SectionSeparator title={humanizeString(groupKey)} />
                </div>
              ) : null}

              <div className={styles.shaIconPickerIconListGroupBody}>
                {memoizedActiveGroup[groupKey].map((item: ShaIconTypes, index) => (
                  <span
                    className={styles.shaIconPickerIconListIcon}
                    onClick={() => handleIconSelection(item)}
                    key={index}
                  >
                    <ShaIcon iconName={item as any} style={{ fontSize: 30, transform: 'scale(.83)' }} />
                    <span className={styles.shaIconPickerIconListIconName}>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default IconPicker;
