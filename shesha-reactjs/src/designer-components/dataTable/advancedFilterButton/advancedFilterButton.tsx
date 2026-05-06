import React from 'react';
import { Badge, Button, Tooltip } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';
import { FCUnwrapped, useDataTableStore } from '@/providers';
import { useStyles } from './style';
import { ButtonType } from 'antd/es/button/buttonHelpers';
import { getGhostStyleOverrides } from '@/utils/style';
import { IAdvancedFilterButtonComponentProps } from './types';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { IconType, ShaIcon } from '@/components/shaIcon';

const splitByCapitalLetters = (str: string): string[] => {
  return isNullOrWhiteSpace(str)
    ? []
    : str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .split(' ');
};

const getIconName = (icon: string | undefined, hasFilters: boolean): string | undefined => {
  if (isNullOrWhiteSpace(icon))
    return undefined;

  const splitIconName = splitByCapitalLetters(icon);
  splitIconName.pop();
  splitIconName.push(hasFilters ? 'Filled' : 'Outlined');
  const iconName = splitIconName.join('');
  return iconName;
};

export const AdvancedFilterButton: FCUnwrapped<IAdvancedFilterButtonComponentProps> = (props) => {
  const {
    isAdvancedFilterVisible,
    toggleAdvancedFilter,
    tableFilter,
  } = useDataTableStore();
  const { styles } = useStyles(props.styles?.fontSize);

  const filterColumns = tableFilter.map((filter) => filter.columnId);
  const hasFilters = filterColumns.length > 0 || isAdvancedFilterVisible;

  // Handle custom 'ghost' buttonType by converting to Ant Design's ghost prop pattern
  const isGhostType = props.buttonType === 'ghost';

  // Build base button style without border/shadow to avoid conflicts
  const baseButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...{ color: props.buttonType !== 'primary' && !props.danger ? styles.primaryColor : '' },
    padding: '3px',
  };

  // Ghost buttons should never have borders, backgrounds, or shadows - only foreground color
  // Link buttons also don't have borders
  // For other types (primary, default, dashed), let the configured styles handle borders/shadows
  const borderStyle = ['link', 'ghost'].includes(props.buttonType)
    ? { border: 'none' }
    : hasFilters
      ? { border: `1px solid ${styles.primaryColor}` }
      : {};

  // Ghost buttons: only foreground color, no background/border/shadow
  const ghostOverrides = isGhostType ? getGhostStyleOverrides({ color: props.color }) : props.styles;

  const buttonStyle = {
    ...baseButtonStyle,
    ...borderStyle,
    ...props.styles,
    ...ghostOverrides,
  };

  const iconName = getIconName(props.icon, hasFilters);
  const filterIcon = iconName
    ? <ShaIcon iconName={iconName as IconType} />
    : hasFilters
      ? <FilterFilled />
      : <FilterOutlined />;
  const actualButtonType = isGhostType ? 'default' : (props.buttonType as ButtonType);

  return (
    <span>
      <Badge
        count={tableFilter.length}
        color={isAdvancedFilterVisible || props.readOnly ? styles.disabledColor : styles.primaryColor}
        size="small"
        title={filterColumns.join('  ')}
      >
        <Tooltip title={props.tooltip}>
          <Button
            type={actualButtonType}
            ghost={isGhostType}
            title={filterColumns.join('  ')}
            onClick={() => toggleAdvancedFilter(true)}
            className={styles.button}
            danger={props.danger === true}
            disabled={props.readOnly || isAdvancedFilterVisible}
            icon={filterIcon}
            size={props.size}
            style={isAdvancedFilterVisible || props.readOnly
              ? { ...buttonStyle, opacity: 0.5, border: ['link', 'ghost'].includes(props.buttonType) ? 'none' : buttonStyle.border }
              : { ...buttonStyle }}
          >
            {props.label}
          </Button>
        </Tooltip>
      </Badge>
    </span>
  );
};
