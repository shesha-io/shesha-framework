import { CSSProperties, FC } from 'react';
import { ButtonGroupItemProps } from '@/providers';
import { Divider, Dropdown } from 'antd';
import { IApplicationContext } from '@/providers/form/utils';
import { addPx } from '@/utils/style';
import { RenderButton } from './renderButton';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import { VisibilityEvaluator } from './models';
import { createMenuItem, defaultGroupStyles } from './utils';
import { IToolboxComponent } from '@/interfaces';
import { deepMergeValues } from '@/utils/object';

interface InlineItemBaseProps {
  uuid: string;
  size: SizeType;
  getIsVisible: VisibilityEvaluator;
  appContext: IApplicationContext;
  buttonComponent: IToolboxComponent;
}

interface InlineItemProps extends InlineItemBaseProps {
  item: ButtonGroupItemProps;
  styles?: CSSProperties | undefined;
}
export const InlineItem: FC<InlineItemProps> = (props) => {
  const { item, uuid, size, getIsVisible, appContext } = props;

  if (isGroup(item)) {
    const menuItems = (item.childItems ?? [])
      .filter((item) => (getIsVisible(item)))
      .map((childItem) => (createMenuItem({ ...childItem, buttonType: childItem.buttonType ?? 'link' }, getIsVisible, appContext, props.buttonComponent)));

    // for backward compatibility
    const defaultStyledItem = deepMergeValues(defaultGroupStyles(), item);

    return (
      <Dropdown key={uuid} menu={{ items: menuItems }} disabled={item.disabled === true}>
        <div> {/* this need to force button style */}
          <RenderButton props={{ ...defaultStyledItem, size }} buttonComponent={props.buttonComponent} />
        </div>
      </Dropdown>
    );
  }

  if (isItem(item)) {
    switch (item.itemSubType) {
      case 'button':
        return <RenderButton props={{ ...item, size }} buttonComponent={props.buttonComponent} />;
      case 'separator':
      case 'line':
        return <Divider orientation="vertical" key={uuid} style={{ width: addPx(item.dividerWidth, appContext), backgroundColor: item.dividerColor }} />;
      default:
        return null;
    }
  }

  return null;
};
