import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon';
import { FilledIconTypes, FILLED_ICON_GROUPS } from './iconNamesFilled';
import { ShaIcon } from '@/components/shaIcon';
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
  value?: string | undefined;

  /** A callback for when the icon changes */
  onIconChange?: (icon: ReactNode, iconName: ShaIconTypes | null) => void;

  /** The size of the select button */
  selectBtnSize?: SizeType | undefined;

  /** if true, indicates that the picker is readonly */
  readOnly?: boolean | undefined;

  twoToneColor?: string | undefined;

  iconSize?: number | undefined;
}

interface IOption {
  mode: IconModes;
  group: typeof FILLED_ICON_GROUPS | typeof OUTLINED_ICON_GROUPS | typeof TWO_FACED_ICON_GROUPS;
}

type IconsGroupType = Record<string, readonly ShaIconTypes[]>;

/**
 * A component for selecting icons, usually for form
 */
const IconPicker: FC<IIconPickerProps> = ({
  selectBtnSize = 'middle',
  value,
  onIconChange,
  readOnly = false,
  iconSize,
  twoToneColor,
  ...props
}) => {
  const { styles } = useStyles();
  const [localSelectedIcon, setLocalSelectedIcon] = useState<ShaIconTypes | undefined>(value as ShaIconTypes);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOption, setSearchOption] = useState<IOption>({
    mode: 'outlined',
    group: ICON_MODE_GROUPS['outlined'],
  });

  useEffect(() => {
    setLocalSelectedIcon(value as ShaIconTypes);
  }, [value]);

  const toggleModalVisibility = (): void => {
    if (!readOnly) setShowModal((visible) => !visible);
  };

  const changeIconModes = (e: RadioChangeEvent): void => {
    const mode = e.target.value as IconModes;

    setSearchOption({ mode, group: ICON_MODE_GROUPS[mode] });
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => setSearchQuery(event.target.value);

  const handleIconSelection = (selected: ShaIconTypes): void => {
    if (readOnly) return;
    setLocalSelectedIcon(selected);
    toggleModalVisibility();

    if (onIconChange) {
      onIconChange(<ShaIcon iconName={selected} style={{ fontSize: 30 }} {...props} />, selected);
    }
  };

  const onClear = (): void => {
    if (readOnly) return;
    setLocalSelectedIcon(undefined);
    toggleModalVisibility();

    if (onIconChange) {
      onIconChange(null, null);
    }
  };

  const memoizedActiveGroup = useMemo<IconsGroupType>(() => {
    if (searchQuery) {
      const activeGroup = searchOption.group as IconsGroupType;
      const filteredGroup: IconsGroupType = {};
      const objectKeys = Object.keys(activeGroup);

      for (const key of objectKeys) {
        filteredGroup[key] = (activeGroup[key] ?? []).filter((groupItem: string) =>
          groupItem.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }
      return filteredGroup;
    } else {
      return searchOption.group as IconsGroupType;
    }
  }, [searchQuery, searchOption.group]);

  return (
    <div className={styles.shaIconPicker}>
      <div>
        <div
          onClick={toggleModalVisibility}
          style={{ pointerEvents: readOnly ? 'none' : 'all' }}
          className={classNames(styles.shaIconPickerSelectedIcon, { 'sha-readonly': readOnly })}
        >
          {localSelectedIcon ? (
            <ShaIcon
              className={styles.shaIconPicker}
              iconName={localSelectedIcon}
              {...props}
              style={{ fontSize: iconSize || 24, color: twoToneColor }}
              name={localSelectedIcon}
            />
          ) : (
            <Button
              size={selectBtnSize}
              title="Select icon"
              disabled={readOnly}
              icon={<SelectOutlined style={{ margin: 0 }} size={iconSize || 24} />}
            >
            </Button>
          )}
        </div>
      </div>
      <Modal
        onCancel={toggleModalVisibility}
        onOk={toggleModalVisibility}
        open={showModal}
        width={950}
        title="Select Icon"
        footer={(
          <div>
            <Button onClick={onClear} type="primary" danger>
              Clear
            </Button>
            <Button onClick={toggleModalVisibility}>Cancel</Button>
          </div>
        )}
        className={styles.shaIconPickerModal}
      >
        <div className={styles.shaIconPickerSearch}>
          <Radio.Group
            options={ICON_MODE_OPTIONS}
            value={searchOption.mode}
            onChange={changeIconModes}
            optionType="button"
          />
          <div className={styles.shaIconPickerSearchInputContainer}>
            <Input.Search allowClear onChange={onSearchChange} value={searchQuery} />
          </div>
        </div>
        <div className={styles.shaIconPickerIconList}>
          {Object.keys(memoizedActiveGroup).map((groupKey) => {
            const group = memoizedActiveGroup[groupKey];
            return (
              <div className={styles.shaIconPickerIconListGroup} key={groupKey}>
                {group?.length ? (
                  <div className={styles.shaIconPickerIconListGroupHeader}>
                    <SectionSeparator title={humanizeString(groupKey)} />
                  </div>
                ) : null}

                <div className={styles.shaIconPickerIconListGroupBody}>
                  {group?.map((item, index) => (
                    <span
                      className={styles.shaIconPickerIconListIcon}
                      onClick={() => handleIconSelection(item)}
                      key={index}
                    >
                      <ShaIcon iconName={item} style={{ fontSize: 30, transform: 'scale(.83)' }} />
                      <span className={styles.shaIconPickerIconListIconName}>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default IconPicker;
