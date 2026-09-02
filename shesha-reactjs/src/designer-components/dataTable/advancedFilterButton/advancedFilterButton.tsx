import { Badge, Tooltip } from 'antd';
import { FCUnwrapped, useDataTableStore } from '@/providers';
import { useStyles } from './style';
import { ButtonType } from 'antd/es/button/buttonHelpers';
import { IAdvancedFilterButtonComponentProps } from './types';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import ConfigurableButton from '@/designer-components/button/configurableButton';
import classNames from 'classnames';

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
  const { styles } = useStyles(props);

  const filterColumns = tableFilter.map((filter) => filter.columnId);
  const hasFilters = filterColumns.length > 0 || isAdvancedFilterVisible;

  // Handle custom 'ghost' buttonType by converting to Ant Design's ghost prop pattern
  const isGhostType = props.buttonType === 'ghost';

  const iconName = getIconName(props.icon, hasFilters);
  const filterIcon = iconName ?? (hasFilters ? 'FilterFilled' : 'FilterOutlined');

  const actualButtonType = isGhostType ? 'default' : (props.buttonType as ButtonType);

  const { marginTop, marginRight, marginBottom, marginLeft, ...padding } = props.stylingBoxJson ?? { _type: 'styleBox' };

  return (
    <div className={classNames(styles.buttonContainer, { disabled: props.disabled, active: isAdvancedFilterVisible })}>
      <Tooltip title={props.tooltip}>
        <Badge
          count={tableFilter.length}
          color={styles.primaryColor}
          size="small"
          title={filterColumns.join('  ')}
        >
          <ConfigurableButton
            {...props}
            buttonType={actualButtonType}
            icon={filterIcon}
            tooltip={filterColumns.join('  ')}
            onClick={() => toggleAdvancedFilter(!isAdvancedFilterVisible)}
            disabled={props.disabled}
            stylingBoxJson={padding}
          />
          {/* <Button
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
          */}
        </Badge>
      </Tooltip>
    </div>
  );
};
