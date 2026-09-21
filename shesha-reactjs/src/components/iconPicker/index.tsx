import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon';
import { FilledIconTypes, FILLED_ICON_GROUPS } from './iconNamesFilled';
import { OutlinedIconTypes, OUTLINED_ICON_GROUPS } from './iconNamesOutlined';
import { TwoToneIconTypes, TWO_FACED_ICON_GROUPS } from './iconNamesTwoTone';
import { ShaIcon, REACT_ICON_FAMILIES, loadFamilyModule, getFamilyIconComponent, buildReactIconValue } from '@/components/shaIcon';
import { computeCommonPrefix, ensureCategoryDataLoaded, getFamilyCategories } from './categoryData';
import { Alert, Button, Input, Modal, Select, Skeleton } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { humanizeString } from '@/utils/string';
import classNames from 'classnames';
import { Grid, type CellComponentProps } from 'react-window';
import { useStyles } from './styles/styles';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

export type ShaIconTypes = FilledIconTypes | OutlinedIconTypes | TwoToneIconTypes;
type IconsGroupType = Record<string, readonly ShaIconTypes[]>;

// Superseded by a newer family already in REACT_ICON_FAMILIES (e.g. Font Awesome 6 replaces 5); ShaIcon can still resolve stored values from these.
const SUPERSEDED_FAMILIES = new Set(['fa', 'io', 'hi']);
const DEFAULT_FAMILY = 'md';

interface IFamilyVariant {
  label: string;
  /** `rest` is the icon's export name with the family's common prefix already stripped. */
  matches: (rest: string) => boolean;
}

// Families whose icon names encode a style variant as a prefix.
const FAMILY_VARIANTS: Record<string, IFamilyVariant[]> = {
  md: [
    { label: 'Outline', matches: (rest) => rest.startsWith('Outline') },
    { label: 'Filled', matches: (rest) => !rest.startsWith('Outline') },
  ],
};

type IPickerOption =
  | { key: string; label: string; kind: 'reactIcons'; family: string; variant?: IFamilyVariant | undefined } |
  { key: string; label: string; kind: 'legacyAntd'; groups: IconsGroupType };

// Ant Design's own curated icon taxonomy, used instead of react-icons' uncategorized "ai" mirror.
const LEGACY_ANTD_OPTIONS: IPickerOption[] = [
  { key: 'antd-outlined', label: 'Ant Design Icons — Outlined', kind: 'legacyAntd', groups: OUTLINED_ICON_GROUPS },
  { key: 'antd-filled', label: 'Ant Design Icons — Filled', kind: 'legacyAntd', groups: FILLED_ICON_GROUPS },
  { key: 'antd-twotone', label: 'Ant Design Icons — Two-tone', kind: 'legacyAntd', groups: TWO_FACED_ICON_GROUPS },
];

// Computed lazily so this file never depends on REACT_ICON_FAMILIES having already initialized.
const getPickerOptions = (): IPickerOption[] => {
  const options: IPickerOption[] = [...LEGACY_ANTD_OPTIONS];
  for (const family of REACT_ICON_FAMILIES) {
    // 'ai' (react-icons' own Ant Design Icons mirror) is superseded by the curated, categorized options above.
    if (SUPERSEDED_FAMILIES.has(family.key) || family.key === 'ai') continue;
    options.push({ key: family.key, label: family.label, kind: 'reactIcons', family: family.key });
    for (const variant of FAMILY_VARIANTS[family.key] ?? []) {
      options.push({ key: `${family.key}::${variant.label}`, label: `${family.label} — ${variant.label}`, kind: 'reactIcons', family: family.key, variant });
    }
  }
  return options;
};

const DEFAULT_OPTION: IPickerOption = { key: DEFAULT_FAMILY, label: 'Material Design icons', kind: 'reactIcons', family: DEFAULT_FAMILY };

const REACT_ICON_GRID_COLUMNS = 6;

interface IReactIconCellProps {
  names: string[];
  iconModule: Record<string, unknown>;
  columnCount: number;
  onSelect: (name: string) => void;
  iconClassName: string;
  iconNameClassName: string;
}

// Module-scope (not defined inside IconPicker) so react-window doesn't see a new component identity on every render.
const ReactIconGridCell = ({
  columnIndex, rowIndex, style, names, iconModule, columnCount, onSelect, iconClassName, iconNameClassName,
}: CellComponentProps<IReactIconCellProps>): React.JSX.Element => {
  const index = rowIndex * columnCount + columnIndex;
  const name = names[index];
  if (!name) return <div style={style} />;
  const Icon = getFamilyIconComponent(iconModule, name);
  if (!Icon) return <div style={style} />;
  return (
    <span
      style={style}
      className={iconClassName}
      title={name}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(name)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(name);
        }
      }}
    >
      <Icon style={{ fontSize: 30 }} />
      <span className={iconNameClassName}>{name}</span>
    </span>
  );
};

export interface IIconPickerProps extends IconBaseProps {
  /** The icon name */
  value?: string | undefined;

  /** A callback for when the icon changes */
  onIconChange?: (icon: ReactNode, iconName: string | null) => void;

  /** The size of the select button */
  selectBtnSize?: SizeType | undefined;

  /** if true, indicates that the picker is readonly */
  readOnly?: boolean | undefined;

  twoToneColor?: string | undefined;

  iconSize?: number | undefined;
}

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
  className,
  ...props
}) => {
  const { styles, cx } = useStyles();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedOptionKey, setSelectedOptionKey] = useState<string>(DEFAULT_FAMILY);
  const [loadedFamily, setLoadedFamily] = useState<string | undefined>(undefined);
  const [familyModule, setFamilyModule] = useState<Record<string, unknown>>({});
  const [familyNames, setFamilyNames] = useState<string[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyLoadError, setFamilyLoadError] = useState<string | undefined>(undefined);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  // Tracks which family the in-flight load belongs to, so a slow, superseded request can't overwrite a newer selection.
  const activeLoadRequestRef = useRef<string | undefined>(undefined);

  const pickerOptions = useMemo(getPickerOptions, []);
  const selectedOption = useMemo<IPickerOption>(
    () => pickerOptions.find((option) => option.key === selectedOptionKey) ?? DEFAULT_OPTION,
    [pickerOptions, selectedOptionKey],
  );

  const toggleModalVisibility = (): void => {
    if (!readOnly) setShowModal((visible) => !visible);
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => setSearchQuery(event.target.value);

  const loadFamily = (family: string): void => {
    setFamilyLoading(true);
    setFamilyLoadError(undefined);
    setActiveCategories(new Set());
    activeLoadRequestRef.current = family;
    // Category data (md/fa6 only) loads alongside the icon set so `familyCategories` is never called before it's ready.
    void Promise.all([loadFamilyModule(family), ensureCategoryDataLoaded(family)])
      .then(([mod]) => {
        if (activeLoadRequestRef.current !== family) return; // A newer family was selected before this one resolved.
        setFamilyModule(mod);
        setFamilyNames(Object.keys(mod).filter((key) => key !== 'default').sort());
        setLoadedFamily(family);
      })
      .catch((error: unknown) => {
        if (activeLoadRequestRef.current !== family) return;
        console.error(`Failed to load icon family "${family}"`, error);
        setFamilyLoadError(family);
      })
      .finally(() => {
        if (activeLoadRequestRef.current === family) setFamilyLoading(false);
      });
  };

  // Load the default family lazily, only once the picker is actually opened.
  useEffect(() => {
    if (showModal && selectedOption.kind === 'reactIcons' && loadedFamily !== selectedOption.family && !familyLoading) {
      loadFamily(selectedOption.family);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const onOptionChange = (optionKey: string): void => {
    setSelectedOptionKey(optionKey);
    setActiveCategories(new Set());
    const nextOption = pickerOptions.find((option) => option.key === optionKey);
    if (nextOption?.kind === 'reactIcons' && nextOption.family !== loadedFamily) {
      loadFamily(nextOption.family);
    }
  };

  const handleReactIconSelection = (exportName: string): void => {
    if (readOnly || selectedOption.kind !== 'reactIcons') return;
    toggleModalVisibility();

    if (onIconChange) {
      const newValue = buildReactIconValue(selectedOption.family, exportName);
      onIconChange(<ShaIcon iconName={newValue} style={{ fontSize: 30 }} {...props} />, newValue);
    }
  };

  const handleLegacyIconSelection = (selected: ShaIconTypes): void => {
    if (readOnly) return;
    toggleModalVisibility();

    if (onIconChange) {
      onIconChange(<ShaIcon iconName={selected} style={{ fontSize: 30 }} {...props} />, selected);
    }
  };

  const onClear = (): void => {
    if (readOnly) return;
    toggleModalVisibility();

    if (onIconChange) {
      onIconChange(null, null);
    }
  };

  const commonPrefix = useMemo(() => computeCommonPrefix(familyNames), [familyNames]);

  const variantFilteredNames = useMemo(() => {
    if (selectedOption.kind !== 'reactIcons' || !selectedOption.variant) return familyNames;
    const variant = selectedOption.variant;
    return familyNames.filter((name) => variant.matches(name.slice(commonPrefix.length)));
  }, [familyNames, selectedOption, commonPrefix]);

  const familyCategories = useMemo(() => {
    if (selectedOption.kind !== 'reactIcons') return new Map<string, string[]>();
    return getFamilyCategories(selectedOption.family, variantFilteredNames, commonPrefix);
  }, [selectedOption, variantFilteredNames, commonPrefix]);

  const filteredFamilyNames = useMemo(() => {
    // Checkbox semantics: any category checked -> union of icons across all checked categories (OR filter).
    let result = activeCategories.size > 0
      ? Array.from(activeCategories).flatMap((category) => familyCategories.get(category) ?? [])
      : variantFilteredNames;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((name) => name.toLowerCase().includes(query));
    }
    return result;
  }, [variantFilteredNames, familyCategories, activeCategories, searchQuery]);

  const legacyFilteredGroups = useMemo<IconsGroupType>(() => {
    if (selectedOption.kind !== 'legacyAntd') return {};
    if (!searchQuery) return selectedOption.groups;
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, readonly ShaIconTypes[]> = {};
    for (const key of Object.keys(selectedOption.groups)) {
      filtered[key] = (selectedOption.groups[key] ?? []).filter((item) => item.toLowerCase().includes(query));
    }
    return filtered;
  }, [selectedOption, searchQuery]);

  // Reuses the same category sidebar as react-icons families instead of inline section headers.
  const legacyCategories = useMemo(() => new Map(Object.entries(legacyFilteredGroups)), [legacyFilteredGroups]);

  const filteredLegacyNames = useMemo(() => (
    activeCategories.size > 0
      ? Array.from(activeCategories).flatMap((category) => legacyCategories.get(category) ?? [])
      : Object.values(legacyFilteredGroups).flat()
  ), [legacyCategories, legacyFilteredGroups, activeCategories]);

  return (
    // The caller's className goes on the root so its descendant rules can reach the glyph.
    <div className={cx(styles.shaIconPicker, className)}>
      <div>
        <div
          onClick={toggleModalVisibility}
          style={{ pointerEvents: readOnly ? 'none' : 'all' }}
          className={classNames(styles.shaIconPickerSelectedIcon, { 'sha-readonly': readOnly })}
        >
          {!isNullOrWhiteSpace(value) ? (
            <ShaIcon
              iconName={value}
              {...props}
              // Only applied when explicitly given, so CSS on the root class isn't overridden by these defaults.
              style={{
                ...(isDefined(iconSize) ? { fontSize: iconSize } : {}),
                ...(isNotNullOrWhiteSpace(twoToneColor) ? { color: twoToneColor } : {}),
                ...props.style,
              }}
              name={value}
            />
          ) : (
            <Button
              size={selectBtnSize}
              title="Select icon"
              disabled={readOnly}
              icon={<SelectOutlined style={{ margin: 0 }} size={iconSize} />}
            >
            </Button>
          )}
        </div>
      </div>
      <Modal
        onCancel={toggleModalVisibility}
        onOk={toggleModalVisibility}
        open={showModal}
        width={1250}
        style={{ top: 24 }}
        styles={{ body: { height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
        title="Select Icon"
        footer={(
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={onClear} type="primary" danger>
              Clear
            </Button>
            <Button onClick={toggleModalVisibility}>Cancel</Button>
          </div>
        )}
        className={styles.shaIconPickerModal}
      >
        <div className={styles.shaIconPickerSearch}>
          <Select
            style={{ minWidth: 280 }}
            value={selectedOption.key}
            onChange={onOptionChange}
            options={pickerOptions.map((option) => ({ value: option.key, label: option.label }))}
            showSearch
            optionFilterProp="label"
          />
          <div className={styles.shaIconPickerSearchInputContainer}>
            <Input.Search allowClear onChange={onSearchChange} value={searchQuery} />
          </div>
        </div>
        {selectedOption.kind === 'legacyAntd' ? (
          <div className={styles.shaIconPickerBrowseArea}>
            <div className={styles.shaIconPickerCategoryIndex}>
              {Array.from(legacyCategories.entries()).map(([category, names]) => (
                <button
                  key={category}
                  type="button"
                  className={classNames(styles.shaIconPickerCategoryIndexItem, { active: activeCategories.has(category) })}
                  onClick={() => setActiveCategories((current) => {
                    const next = new Set(current);
                    if (next.has(category)) {
                      next.delete(category);
                    } else {
                      next.add(category);
                    }
                    return next;
                  })}
                >
                  <span className={styles.shaIconPickerCategoryIndexItemLabel}>{humanizeString(category)}</span>
                  <span className={styles.shaIconPickerCategoryIndexItemCount}>{names.length}</span>
                </button>
              ))}
            </div>
            <div className={styles.shaIconPickerLegacyList}>
              <div className={styles.shaIconPickerIconListGroupBody}>
                {filteredLegacyNames.map((item, index) => (
                  <span
                    className={styles.shaIconPickerIconListIcon}
                    onClick={() => handleLegacyIconSelection(item)}
                    key={index}
                  >
                    <ShaIcon iconName={item} style={{ fontSize: 30, transform: 'scale(.83)' }} />
                    <span className={styles.shaIconPickerIconListIconName}>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : familyLoading ? (
          <Skeleton active />
        ) : familyLoadError !== undefined && familyLoadError === selectedOption.family ? (
          <Alert type="error" showIcon title="Failed to load this icon family." />
        ) : (
          <div className={styles.shaIconPickerBrowseArea}>
            <div className={styles.shaIconPickerCategoryIndex}>
              {Array.from(familyCategories.entries()).map(([category, names]) => (
                <button
                  key={category}
                  type="button"
                  className={classNames(styles.shaIconPickerCategoryIndexItem, { active: activeCategories.has(category) })}
                  onClick={() => setActiveCategories((current) => {
                    const next = new Set(current);
                    if (next.has(category)) {
                      next.delete(category);
                    } else {
                      next.add(category);
                    }
                    return next;
                  })}
                >
                  <span className={styles.shaIconPickerCategoryIndexItemLabel}>{category}</span>
                  <span className={styles.shaIconPickerCategoryIndexItemCount}>{names.length}</span>
                </button>
              ))}
            </div>
            <div className={styles.shaIconPickerIconList}>
              <Grid
                cellComponent={ReactIconGridCell}
                cellProps={{
                  names: filteredFamilyNames,
                  iconModule: familyModule,
                  columnCount: REACT_ICON_GRID_COLUMNS,
                  onSelect: handleReactIconSelection,
                  iconClassName: styles.shaIconPickerIconListIcon,
                  iconNameClassName: styles.shaIconPickerIconListIconName,
                }}
                columnCount={REACT_ICON_GRID_COLUMNS}
                // Percentage, not a fixed pixel value, so columns fill whatever width the grid measures.
                columnWidth={`${100 / REACT_ICON_GRID_COLUMNS}%`}
                rowCount={Math.max(1, Math.ceil(filteredFamilyNames.length / REACT_ICON_GRID_COLUMNS))}
                rowHeight={100}
                defaultHeight={500}
                defaultWidth={900}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IconPicker;
