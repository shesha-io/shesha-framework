import React, { FC } from 'react';
import { ButtonGroupItemProps, IButtonGroup } from '@/providers/buttonGroupConfigurator/models';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { useStyles } from '@/components/listEditor/styles/styles';
import { isPropertySettings } from '@/designer-components/_settings/utils';

export interface IContainerRenderArgs {
  index?: number[];
  id?: string;
  items: ButtonGroupItemProps[];

  onChange: (newValue: ButtonGroupItemProps[]) => void;
}

export interface IButtonGroupItemsGroupProps {
  index: number[];
  item: IButtonGroup;
  onChange: (newValue: IButtonGroup) => void;
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
}

export const ButtonGroupItemsGroup: FC<IButtonGroupItemsGroupProps> = ({ item, index, onChange, containerRendering }) => {
  const { styles } = useStyles();
  
  const label = isPropertySettings(item.label) ? (item.label._value ?? item.name) + ' {JS calculated}' : item.label;
  const tooltip = isPropertySettings(item.tooltip) ? item.tooltip._value + ' {JS calculated}' : item.tooltip;

  return (
    <>
      {item.icon && <ShaIcon iconName={item.icon as IconType} />}
      <span className={styles.listItemName}>{label || item.name}</span>
      {tooltip && (
        <Tooltip title={tooltip}>
          <QuestionCircleOutlined className={styles.helpIcon} />
        </Tooltip>
      )}
      {containerRendering({
        index: index,
        items: item.childItems || [],
        onChange: (newItems) => {
          onChange({ ...item, childItems: [...newItems] });
        }
      })}
    </>
  );
};