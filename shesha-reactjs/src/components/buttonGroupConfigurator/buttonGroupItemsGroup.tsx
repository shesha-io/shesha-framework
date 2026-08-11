import { FC } from 'react';
import * as React from 'react';
import { ButtonGroupItemProps, IButtonGroup } from '@/providers/buttonGroupConfigurator/models';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStyles } from '@/components/listEditor/styles/styles';
import { ItemChangeDetails } from '../listEditor';
import { useActualContextData } from '@/hooks';
import { RenderButton } from '@/designer-components/button/buttonGroup/renderButton';
import { deepMergeValues } from '@/utils/object';
import { defaultGroupStyles } from '@/designer-components/button/buttonGroup/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { IToolboxComponent } from '@/interfaces';

export interface IContainerRenderArgs {
  index?: number[];
  id?: string;
  items: ButtonGroupItemProps[];
  onChange: (newValue: ButtonGroupItemProps[], changeDetails?: ItemChangeDetails) => void;
}

export interface IButtonGroupItemsGroupProps {
  index: number[];
  item: IButtonGroup;
  onChange: (newValue: IButtonGroup, changeDetails?: ItemChangeDetails) => void;
  containerRendering: (args: IContainerRenderArgs) => React.ReactNode;
  buttonComponent: IToolboxComponent;
}

export const ButtonGroupItemsGroup: FC<IButtonGroupItemsGroupProps> = ({ item, index, onChange, containerRendering, buttonComponent }) => {
  const { styles } = useStyles();
  const actualItem = useActualContextData(item);

  if (!isDefined(buttonComponent)) return null;

  const { tooltip } = actualItem;

  // for backward compatibility
  const defaultStyledItem = deepMergeValues(defaultGroupStyles(), actualItem);

  return (
    <>
      <RenderButton props={{ ...defaultStyledItem }} uuid={item.id} buttonComponent={buttonComponent} />
      {!isNullOrWhiteSpace(tooltip) && <Tooltip title={tooltip}><QuestionCircleOutlined className={styles.helpIcon} /></Tooltip>}
      {containerRendering({
        index: index,
        items: item.childItems || [],
        onChange: (newItems, changeDetails) => {
          onChange({ ...item, childItems: [...newItems] }, changeDetails);
        },
      })}
    </>
  );
};
