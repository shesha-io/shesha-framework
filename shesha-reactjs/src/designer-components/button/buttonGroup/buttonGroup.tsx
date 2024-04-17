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
import { DownOutlined } from '@ant-design/icons';
import { DynamicActionsEvaluator } from '@/providers/dynamicActions/evaluator/index';
import {
    getActualModel,
    getStyle,
    IApplicationContext,
    useAvailableConstantsData
} from '@/providers/form/utils';
import { getButtonGroupMenuItem } from './utils';
import { IButtonGroupProps } from './models';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useDeepCompareMemo } from '@/hooks';
import { useSheshaApplication } from '@/providers';
import type { MenuProps } from 'antd';
import { useStyles } from './styles/styles';
import classNames from 'classnames';

type MenuItem = MenuProps['items'][number];

type PrepareItemFunc = (item: ButtonGroupItemProps, parentReadOnly: boolean) => ButtonGroupItemProps;

type MenuButton = ButtonGroupItemProps & {
    childItems?: MenuButton[];
};

const renderButton = (props: ButtonGroupItemProps, uuid: string, size: SizeType, appContext: IApplicationContext) => {
    return (
        <ConfigurableButton
            key={uuid}
            {...props}
            size={size}
            style={getStyle(props?.style, appContext.data)}
            readOnly={props.readOnly}
            buttonType={props.buttonType}
        />
    );
};

const createMenuItem = (
    props: MenuButton,
    size: SizeType,
    getIsVisible: VisibilityEvaluator,
    appContext: IApplicationContext,
    prepareItem: PrepareItemFunc,
): MenuItem => {
    const buttonProps = props.itemType === 'item' ? (props as IButtonGroupItem) : null;
    const isDivider = buttonProps && (buttonProps.itemSubType === 'line' || buttonProps.itemSubType === 'separator');

    const childItems = props.childItems && props.childItems.length > 0
        ? props.childItems.map(x => prepareItem(x, props.readOnly)).filter(getIsVisible)?.map((props) => createMenuItem(props, size, getIsVisible, appContext, prepareItem))
        : null;

    return isDivider
        ? { type: 'divider' }
        : getButtonGroupMenuItem(
            renderButton(props, props?.id, size, appContext),
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
    prepareItem: PrepareItemFunc;
}
const InlineItem: FC<InlineItemProps> = (props) => {
    const { item, uuid, size, getIsVisible, appContext, prepareItem } = props;

    //const itemProps = prepareItem(item) as ButtonGroupItemProps;
    if (isGroup(item)) {
        const menuItems = item.childItems.map(x => prepareItem(x, item.readOnly))
            .filter(item => (getIsVisible(item)))
            .map(childItem => (createMenuItem({ ...childItem, buttonType: 'link' }, size, getIsVisible, appContext, prepareItem)));
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
                    {item.label}
                    <DownOutlined />
                </Button>
            </Dropdown>
        );
    }

    if (isItem(item)) {
        switch (item.itemSubType) {
            case 'button':
                return renderButton(item, uuid, size, appContext);
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

export const ButtonGroupInner: FC<IButtonGroupProps> = ({ items, size, spaceSize = 'middle', isInline, noStyles, disabled }) => {
    const { styles } = useStyles();
    const allData = useAvailableConstantsData();
    const { anyOfPermissionsGranted } = useSheshaApplication();

    const isDesignMode = allData.formMode === 'designer';

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

    const prepareItem: PrepareItemFunc = (item, parentReadOnly) => {
        if (item.editMode === undefined)
            item.editMode = 'inherited'; // prepare editMode property if not exist for updating inside getActualModel
        const result = getActualModel(item, allData, parentReadOnly);
        return { ...result};
    };

    const actualItems = useDeepCompareMemo(() =>
        items?.map((item) => prepareItem(item, disabled))
    , [items, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);

    const filteredItems = actualItems?.filter(getIsVisible);

    if (actualItems.length === 0 && isDesignMode)
        return (
            <Alert
                className="sha-designer-warning"
                message="Button group is empty. Press 'Customize Button Group' button to add items"
                type="warning"
            />
        );

    if (isInline) {
        return (
            <div className={noStyles ? null : styles.shaResponsiveButtonGroupInlineContainer}>
                <Space size={spaceSize}>
                    {filteredItems?.map((item) =>
                        (<InlineItem item={item} uuid={item.id} size={size} getIsVisible={getIsVisible} appContext={allData} key={item.id} prepareItem={prepareItem} />)
                    )}
                </Space>
            </div>
        );
    } else {
        const menuItems = filteredItems?.map((props) => createMenuItem(props, size, getIsVisible, allData, prepareItem));
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
    return (
        <DynamicActionsEvaluator items={props.items}>
            {(items) => (<ButtonGroupInner {...props} items={items} />)}
        </DynamicActionsEvaluator>
    );
};