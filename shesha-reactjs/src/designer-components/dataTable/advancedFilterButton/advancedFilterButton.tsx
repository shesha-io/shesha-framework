import React, { FC, useEffect, useState } from 'react';
import { Badge, Button } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';
import { useDataTableStore, useFormData } from '@/providers';
import { useStyles } from './style';
import { IButtonComponentProps } from '@/designer-components/button/interfaces';
import * as Icons from '@ant-design/icons';
import { getStyle } from '@/providers/form/utils';

export const AdvancedFilterButton: FC<IButtonComponentProps> = (props) => {
  const {
    isInProgress: { isFiltering },
    setIsInProgressFlag,
    tableFilter,
  } = useDataTableStore();

  const [icon, setIcon] = useState(null);
  const { data: formData } = useFormData();
  const { styles } = useStyles();

  const localStyle = getStyle(props.style, formData);

  const filterColumns = tableFilter?.map((filter) => filter.columnId);
  const hasFilters = filterColumns?.length > 0 || isFiltering;

  const buttonStyle = {
    ...localStyle,
    ...{ color: props.buttonType !== 'primary' && !props.danger ? styles.primaryColor : '' },
    border: hasFilters ? `1px solid ${styles.primaryColor}` : 'none',
  };

  const startFilteringColumns = () => setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });

  const splitByCapitalLetters = (str: string) => {
    return str
      ?.replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .split(' ');
  };

  const customIcon = () => {
    if (props.icon) {
      const splitIconName = splitByCapitalLetters(props.icon);
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

  return (
    <Badge
      count={tableFilter?.length}
      color={isFiltering || props.readOnly ? styles.disabledColor : styles.primaryColor}
      size="small"
      title={filterColumns?.join('  ')}
    >
      <Button
        type={props.buttonType}
        title={filterColumns?.join('  ')}
        onClick={startFilteringColumns}
        className={styles.button}
        danger={props.danger}
        disabled={props.readOnly || isFiltering}
        icon={filterIcon}
        size={props.size}
        style={isFiltering || props.readOnly ? {} : { ...buttonStyle }}
      >
        {props.label}
      </Button>
    </Badge>
  );
};
