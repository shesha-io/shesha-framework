import React, { FC } from 'react';
import ShaIcon, { IconType } from '@/components/shaIcon/index';
import {
    Alert,
    Button,
    Divider,
    Dropdown,
    Menu,
    Space
} from 'antd';
import {
    ButtonGroupItemProps,
    IButtonGroup,
    IButtonGroupItem,
    isGroup,
    isItem
} from '@/providers/buttonGroupConfigurator/models';
import { ConfigurableButton } from '../configurableButton';
import { DynamicActionsEvaluator } from '@/providers/dynamicActions/evaluator/index';
import {
    getStyle,
    IApplicationContext,
    useAvailableConstantsData
} from '@/providers/form/utils';
import { getButtonGroupMenuItem } from './utils';
import { IButtonGroupProps } from './models';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useSheshaApplication } from '@/providers';
import type { FormInstance, MenuProps } from 'antd';
import { useStyles } from './styles/styles';
import classNames from 'classnames';
import { addPx } from '../util';
import { removeNullUndefined } from '@/providers/utils';
import { useDeepCompareMemo } from '@/hooks';
import { useActualContextData } from '@/hooks/useActualContextData';
import { standartActualModelPropertyFilter } from '@/components/formDesigner/formComponent';

type MenuItem = MenuProps['items'][number];

type MenuButton = ButtonGroupItemProps & {
    childItems?: MenuButton[];
};

const renderButton = (props: ButtonGroupItemProps, uuid: string, appContext: IApplicationContext, form?: FormInstance<any>) => {

    const { width, height, backgroundColor, fontSize, color, fontWeight, borderWidth, borderColor, borderStyle, borderRadius, size, buttonType } = props;
    const newStyles = {
        width: addPx(width),
        height: addPx(height),
        backgroundColor: backgroundColor,
        fontSize: addPx(fontSize),
        color: color,
        fontWeight: fontWeight,
        borderWidth: addPx(borderWidth),
        borderColor: borderColor,
        borderStyle: borderStyle,
        borderRadius: addPx(borderRadius)
    };

    return (
        <ConfigurableButton
            key={uuid}
            {...props}
            size={size}
            style={removeNullUndefined({ ...getStyle(props?.style, appContext.data), ...newStyles })}
            readOnly={props.readOnly}
            buttonType={buttonType}
            form={form}
        />
    );
};

const createMenuItem = (
    props: MenuButton,
    getIsVisible: VisibilityEvaluator,
    appContext: IApplicationContext,
    form: FormInstance<any>
): MenuItem => {
    const buttonProps = props.itemType === 'item' ? (props as IButtonGroupItem) : null;
    const isDivider = buttonProps && (buttonProps.itemSubType === 'line' || buttonProps.itemSubType === 'separator');

    const childItems = props.childItems && props.childItems.length > 0
        ? props.childItems.filter(getIsVisible)?.map((props) => createMenuItem(props, getIsVisible, appContext, form))
        : null;

    return isDivider
        ? { type: 'divider' }
        : getButtonGroupMenuItem(
            renderButton(props, props?.id, appContext, form),
            props.id,
            props.readOnly,
            childItems
        );
};

type VisibilityEvaluator = (item: ButtonGroupItemProps) => boolean;

interface InlineItemBaseProps {
    uuid: string;
    size: SizeType;
    getIsVisible: VisibilityEvaluator;
    appContext: IApplicationContext;
}

interface InlineItemProps extends InlineItemBaseProps {
    item: ButtonGroupItemProps;
    form?: FormInstance<any>;
}
const InlineItem: FC<InlineItemProps> = (props) => {
    const { item, uuid, getIsVisible, appContext, form } = props;

    if (isGroup(item)) {
        const menuItems = item.childItems
            .filter(item => (getIsVisible(item)))
            .map(childItem => (createMenuItem({ ...childItem, buttonType: childItem.buttonType ?? 'link' }, getIsVisible, appContext, form)));
        return (
            <Dropdown
                key={uuid}
                menu={{ items: menuItems }}
                disabled={item.readOnly}
            >
                <Button
                    icon={item.icon ? <ShaIcon iconName={item.icon as IconType} /> : undefined}
                    type={item.buttonType}
                    title={item.tooltip}
                    disabled={item.readOnly}

                >
                    {item.label ? item.label : undefined}
                    {item.downIcon ? <ShaIcon iconName={item.downIcon as IconType} /> : undefined}
                </Button>
            </Dropdown>
        );
    }

    if (isItem(item)) {
        switch (item.itemSubType) {
            case 'button':
                return renderButton(item, uuid, appContext, form);
            case 'separator':
            case 'line':
                return <Divider type='vertical' key={uuid} />;
            default:
                return null;
        }
    }

    return null;
};

type ItemVisibilityFunc = (item: ButtonGroupItemProps) => boolean;

export const ButtonGroupInner: FC<IButtonGroupProps> = ({ items, size, spaceSize = 'middle', isInline, form }) => {
    const { styles } = useStyles();
    const allData = useAvailableConstantsData();
    const { anyOfPermissionsGranted } = useSheshaApplication();

    const isDesignMode = allData.form?.formMode === 'designer';

    const isVisibleBase = (item: ButtonGroupItemProps): boolean => {
        const { permissions, hidden } = item;
        if (hidden)
            return false;

        const granted = anyOfPermissionsGranted(permissions || []);
        return granted;
    };

    const isGroupVisible = (group: IButtonGroup, itemVibilityFunc: ItemVisibilityFunc): boolean => {
        if (!isVisibleBase(group))
            return false;

        if (group.hideWhenEmpty) {
            const firstVisibleItem = group.childItems.find(item => {
                // analyze buttons and groups only
                return (isItem(item) && item.itemSubType === 'button' || isGroup(item)) && itemVibilityFunc(item);
            });
            if (!firstVisibleItem)
                return false;
        }

        return true;
    };

    // Return the visibility state of a button. A button is visible is it's not hidden and the user is permitted to view it
    const getIsVisible = (item: ButtonGroupItemProps) => {
        if (isDesignMode)
            return true; // show visibility indicator

        return isItem(item) && isVisibleBase(item) || isGroup(item) && isGroupVisible(item, getIsVisible);
    };

    const filteredItems = items?.filter(getIsVisible);

    if (items.length === 0 && isDesignMode)
        return (
            <Alert
                className="sha-designer-warning"
                message="Button group is empty. Press 'Customize Button Group' button to add items"
                type="warning"
            />
        );

    if (isInline) {
        return (
            <Button.Group size={size}>
                <Space size={spaceSize}>
                    {filteredItems?.map((item) =>
                        (<InlineItem item={item} uuid={item.id} size={item.size} getIsVisible={getIsVisible} appContext={allData} key={item.id} form={form} />)
                    )}
                </Space>
            </Button.Group>
        );
    } else {
        const menuItems = filteredItems?.map((props) => createMenuItem(props, getIsVisible, allData, form));
        return (
            <div className={styles.shaResponsiveButtonGroupContainer}>
                <Menu
                    mode="horizontal"
                    items={menuItems}
                    className={classNames(styles.shaResponsiveButtonGroup, `space-${spaceSize}`)}
                    style={{ width: '30px' }}
                />
            </div>
        );
    }
};

export const ButtonGroup: FC<IButtonGroupProps> = (props) => {
    const items = useActualContextData(props.items.map(item => ({ ...item, size: item.size ?? props.size ?? 'middle' })), props.readOnly, null, standartActualModelPropertyFilter);

    const memoizedItems = useDeepCompareMemo(() => items, [items]);

    return (
        <DynamicActionsEvaluator items={memoizedItems}>
            {(items) => (<ButtonGroupInner {...props} items={items} />)}
        </DynamicActionsEvaluator>
    );
};
