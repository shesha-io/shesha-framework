import { FC } from 'react';
import { Alert, Menu, Space } from 'antd';
import { ButtonGroupItemProps, IButtonGroup, isGroup, isItem } from '@/providers/buttonGroupConfigurator/models';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { IButtonGroupProps, VisibilityEvaluator } from './models';
import { useSheshaApplication } from '@/providers';
import { useStyles } from './styles/styles';
import classNames from 'classnames';
import { getOverflowStyle } from '@/designer-components/_settings/utils/overflow/util';
import { InlineItem } from './inlineItem';
import { createMenuItem } from './utils';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { isDefined } from '@/utils';


export const ButtonGroup: FC<IButtonGroupProps> = (props) => {
  const { styles } = useStyles(props);
  const allData = useAvailableConstantsData();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const componentGetter = useFormDesignerComponentGetter();
  const buttonComponent = componentGetter('button');

  if (!isDefined(buttonComponent)) return null;

  const { size = props.size, gap = props.spaceSize ?? 'middle', buttonGroupStyle = 'horizontal' } = props;

  const isDesignMode = allData.form?.formMode === 'designer';

  const isVisibleBase = (item: ButtonGroupItemProps): boolean => {
    const { permissions, visible, hidden } = item;
    if (visible === false || (visible === undefined && hidden === true))
      return false;

    const granted = anyOfPermissionsGranted(permissions || []);
    return granted;
  };

  const isGroupVisible = (group: IButtonGroup, itemVibilityFunc: VisibilityEvaluator): boolean => {
    if (!isVisibleBase(group))
      return false;

    if (group.hideWhenEmpty === true) {
      const firstVisibleItem = (group.childItems ?? []).find((item) => {
        // analyze buttons and groups only
        return ((isItem(item) && item.itemSubType === 'button') || isGroup(item)) && itemVibilityFunc(item);
      });
      if (!firstVisibleItem)
        return false;
    }

    return true;
  };

  // Return the visibility state of a button. A button is visible is it's not hidden and the user is permitted to view it
  const getIsVisible = (item: ButtonGroupItemProps): boolean => {
    if (isDesignMode)
      return true; // show visibility indicator

    return (isItem(item) && isVisibleBase(item)) || (isGroup(item) && isGroupVisible(item, getIsVisible));
  };

  const resolvedItems = props.items;

  const filteredItems = resolvedItems.filter(getIsVisible);

  if (resolvedItems.length === 0 && isDesignMode)
    return <Alert className="sha-designer-warning" title="Button group is empty. Press 'Customize Button Group' button to add items" type="warning" />;

  if (buttonGroupStyle === 'horizontal') {
    return (
      <Space.Compact size={size} style={{ ...props.styleCss, ...getOverflowStyle(true, false) }} className={classNames(styles.shaHideEmpty, styles.shaButtonGroupContainer)}>
        <Space size={gap}>
          {filteredItems.map((item) =>
            (<InlineItem styles={item.styleCss} item={item} uuid={item.id} size={item.size ?? size} getIsVisible={getIsVisible} appContext={allData} key={item.id} buttonComponent={buttonComponent} />),
          )}
        </Space>
      </Space.Compact>
    );
  } else {
    const menuItems = filteredItems.map((item) => createMenuItem(item, getIsVisible, allData, buttonComponent));

    return (
      <div className={classNames(styles.shaResponsiveButtonGroupContainer)}>
        <Menu
          mode="horizontal"
          items={menuItems}
          className={classNames(styles.shaResponsiveButtonGroup, styles.shaButtonGroupContainer, styles.a, `space-${gap}`)}
          style={{ width: '30px', height: '30px', ...props.styleCss }}
        />
      </div>
    );
  }
};
