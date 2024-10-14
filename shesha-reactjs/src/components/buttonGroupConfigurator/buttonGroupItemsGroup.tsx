import React, { FC, useMemo } from 'react';
import { ButtonGroupItemProps, IButtonGroup } from '@/providers/buttonGroupConfigurator/models';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { useStyles } from '@/components/listEditor/styles/styles';
import { getActualModel } from '@/providers/form/utils';
import { ItemChangeDetails } from '../listEditor';

export interface IContainerRenderArgs {
  index?: number[];
  id?: string;
  items: ButtonGroupItemProps[];

  onChange: (newValue: ButtonGroupItemProps[], changeDetails: ItemChangeDetails) => void;
}

export interface IButtonGroupItemsGroupProps {
  index: number[];
  item: IButtonGroup;
  onChange: (newValue: IButtonGroup, changeDetails: ItemChangeDetails) => void;
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
  actualModelContext?: any;
}

export const ButtonGroupItemsGroup: FC<IButtonGroupItemsGroupProps> = ({ item, index, onChange, containerRendering, actualModelContext }) => {
  const { styles } = useStyles();
  const actualItem = useMemo(() => getActualModel(item, actualModelContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [item.label, item.icon, item.tooltip, item.name, actualModelContext]);

  const { icon, label, tooltip, name } = actualItem;

  return (
    <>
      {icon && <ShaIcon iconName={icon as IconType} />}
      <span className={styles.listItemName}>{label || name}</span>
      {tooltip && (
        <Tooltip title={tooltip}>
          <QuestionCircleOutlined className={styles.helpIcon} />
        </Tooltip>
      )}
      {containerRendering({
        index: index,
        items: item.childItems || [],
        onChange: (newItems, changeDetails) => {
          onChange({ ...item, childItems: [...newItems] }, changeDetails);
        }
      })}
    </>
  );
};