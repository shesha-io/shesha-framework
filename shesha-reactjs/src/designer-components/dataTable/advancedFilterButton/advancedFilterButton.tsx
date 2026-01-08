import React, { FC, useEffect, useState } from 'react';
import { Badge, Button, Tooltip } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';
import { useDataTableStore } from '@/providers';
import { useStyles } from './style';
import * as Icons from '@ant-design/icons';
import { ButtonType } from 'antd/es/button/buttonHelpers';
import { getGhostStyleOverrides } from '@/utils/style';
import { IAdvancedFilterButtonComponentProps } from './types';

export const AdvancedFilterButton: FC<IAdvancedFilterButtonComponentProps> = (props) => {
  const {
    isInProgress: { isFiltering },
    setIsInProgressFlag,
    tableFilter,
  } = useDataTableStore();
  const [icon, setIcon] = useState(null);
  const { styles } = useStyles(props.styles?.fontSize);

  const filterColumns = tableFilter?.map((filter) => filter.columnId);
  const hasFilters = filterColumns?.length > 0 || isFiltering;

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
  const ghostOverrides = isGhostType ? getGhostStyleOverrides() : {};

  const buttonStyle = {
    ...baseButtonStyle,
    ...borderStyle,
    ...props.styles,
    ...ghostOverrides,
  };

  const startFilteringColumns = (): void => setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });

  const splitByCapitalLetters = (str: string): string[] => {
    return str
      ?.replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .split(' ');
  };

  const customIcon = (): FC | null => {
    if (props.icon) {
      const splitIconName = splitByCapitalLetters(props.icon as string);
      splitIconName.pop();
      splitIconName.push(hasFilters ? 'Filled' : 'Outlined');
      const iconName = splitIconName.join('');

      return Icons[iconName];
    }

    return null;
  };

  useEffect(() => {
    setIcon(customIcon());
  }, [props.icon, hasFilters]);

  const IconComponent = icon;
  const defaultIcon = hasFilters ? <FilterFilled /> : <FilterOutlined />;
  const filterIcon = icon ? <IconComponent /> : defaultIcon;
  const actualButtonType = isGhostType ? 'default' : (props.buttonType as ButtonType);

  return (
    <span>
      <Badge
        count={tableFilter?.length}
        color={isFiltering || props.readOnly ? styles.disabledColor : styles.primaryColor}
        size="small"
        title={filterColumns?.join('  ')}
      >
        <Tooltip title={props.tooltip}>
          <Button
            type={actualButtonType}
            ghost={isGhostType}
            title={filterColumns?.join('  ')}
            onClick={startFilteringColumns}
            className={styles.button}
            danger={props.danger}
            disabled={props.readOnly || isFiltering}
            icon={filterIcon}
            size={props.size}
            style={isFiltering || props.readOnly
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
