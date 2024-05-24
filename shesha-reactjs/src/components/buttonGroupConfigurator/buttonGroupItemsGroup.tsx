import React, { FC } from 'react';
import { ButtonGroupItemProps, IButtonGroup } from '@/providers/buttonGroupConfigurator/models';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { useStyles } from '@/components/listEditor/styles/styles';

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
  return (
    <>
      {item.icon && <ShaIcon iconName={item.icon as IconType} />}
      <span className={styles.listItemName}>{item.label || item.name}</span>
      {item.tooltip && (
        <Tooltip title={item.tooltip}>
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