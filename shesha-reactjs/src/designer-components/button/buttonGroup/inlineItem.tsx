import { CSSProperties, FC } from 'react';
import { ButtonGroupItemProps } from '@/providers';
import { Divider, Dropdown } from 'antd';
import { IApplicationContext } from '@/providers/form/utils';
import { addPx } from '@/utils/style';
import { RenderButton } from './renderButton';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import { ItemBooleanEvaluator } from './models';
import { createMenuItem, defaultGroupStyles } from './utils';
import { IToolboxComponent } from '@/interfaces';
import { deepMergeValues } from '@/utils/object';

interface InlineItemBaseProps {
  uuid: string;
  size: SizeType;
  getIsVisible: ItemBooleanEvaluator;
  getIsDisabled: ItemBooleanEvaluator;
  appContext: IApplicationContext;
  buttonComponent: IToolboxComponent;
}

interface InlineItemProps extends InlineItemBaseProps {
  item: ButtonGroupItemProps;
  styles?: CSSProperties | undefined;
}
export const InlineItem: FC<InlineItemProps> = (props) => {
  const { item, uuid, size, getIsVisible, getIsDisabled, appContext } = props;

  const disabled = getIsDisabled(item);

  if (isGroup(item)) {
    const menuItems = (item.childItems ?? [])
      .filter((item) => (getIsVisible(item)))
      .map((childItem) => (createMenuItem({ ...childItem, buttonType: childItem.buttonType ?? 'link' }, getIsVisible, getIsDisabled, appContext, props.buttonComponent)));

    // for backward compatibility
    const defaultStyledItem = deepMergeValues(defaultGroupStyles(), item);

    return (
      <Dropdown key={uuid} menu={{ items: menuItems }} disabled={disabled}>
        <div> {/* this need to force button style */}
          <RenderButton props={{ ...defaultStyledItem, size, disabled }} buttonComponent={props.buttonComponent} />
        </div>
      </Dropdown>
    );
  }

  if (isItem(item)) {
    switch (item.itemSubType) {
      case 'button':
        return <RenderButton props={{ ...item, size, disabled: disabled }} buttonComponent={props.buttonComponent} />;
      case 'separator':
      case 'line':
        return <Divider orientation="vertical" key={uuid} style={{ width: addPx(item.dividerWidth, appContext), backgroundColor: item.dividerColor }} />;
      default:
        return null;
    }
  }

  return null;
};
