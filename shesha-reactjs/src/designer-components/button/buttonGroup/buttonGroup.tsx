import React, { CSSProperties, FC, useCallback, useEffect, useState } from 'react';
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
    getActualModel,
    getStyle,
    IApplicationContext,
    pickStyleFromModel,
    useAvailableConstantsData
} from '@/providers/form/utils';
import { getButtonGroupMenuItem } from './utils';
import { IButtonGroupProps } from './models';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useActualContextData, useDeepCompareMemo } from '@/hooks';
import { useSheshaApplication } from '@/providers';
import type { FormInstance, MenuProps } from 'antd';
import { useStyles } from './styles/styles';
import classNames from 'classnames';
import { removeNullUndefined } from '@/providers/utils';
import { getDimensionsStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { getBorderStyle } from '@/designer-components/_settings/utils/border/utils';
import { getFontStyle } from '@/designer-components/_settings/utils/font/utils';
import { getShadowStyle } from '@/designer-components/_settings/utils/shadow/utils';
import { getBackgroundImageUrl, getBackgroundStyle } from '@/designer-components/_settings/utils/background/utils';
import ValidationErrors from '@/components/validationErrors';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { removeUndefinedProps } from '@/utils/object';
import { getOverflowStyle } from '@/designer-components/_settings/utils/overflow/util';
import { standartActualModelPropertyFilter } from '@/components/formDesigner/formComponent';
import { addPx } from '@/utils/style';

type MenuItem = MenuProps['items'][number];

type PrepareItemFunc = (item: ButtonGroupItemProps, parentReadOnly: boolean) => ButtonGroupItemProps;

type MenuButton = ButtonGroupItemProps & {
    childItems?: MenuButton[];
    dividerWidth?: string;
    dividerColor?: string;
};

const RenderButton: FC<{ props: ButtonGroupItemProps; uuid: string; appContext: IApplicationContext; form?: FormInstance<any> }> = ({ props, uuid, appContext, form }) => {
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const [imageUrl, setImageUrl] = useState<string>('');
    const { size, buttonType, background } = props;
    const model = props;

    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const jsStyle = getStyle(model.style, appContext.data);

    const dimensionsStyles = getDimensionsStyle(dimensions);
    const borderStyles = getBorderStyle(border, jsStyle);
    const fontStyles = getFontStyle(font);
    const shadowStyles = getShadowStyle(shadow);

    useEffect(() => {
        const fetchImage = async () => {
            const url = await getBackgroundImageUrl(background, backendUrl, httpHeaders);
            setImageUrl(url);
        };
        fetchImage();
    }, [background, backendUrl, httpHeaders]);

    const additionalStyles: CSSProperties = removeUndefinedProps({
        ...dimensionsStyles,
        ...fontStyles,
        ...(['primary', 'default'].includes(buttonType) && borderStyles),
        ...(['primary', 'default'].includes(buttonType) && shadowStyles),
        ...(['dashed', 'default'].includes(buttonType) && getBackgroundStyle(background, jsStyle, imageUrl)),
        ...jsStyle,
        justifyContent: font?.align,
    });

    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
        return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const finalStyles = removeUndefinedProps({
        ...finalStyle, ...stylingBoxAsCSS, '--ant-button-padding-block-lg': '0px'
    });

    return (
        <ConfigurableButton
            key={uuid}
            {...props}
            size={size}
            style={removeNullUndefined({ ...finalStyles })}
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
    prepareItem: PrepareItemFunc,
    form: FormInstance<any>
): MenuItem => {
    const buttonProps = props.itemType === 'item' ? (props as IButtonGroupItem) : null;
    const isDivider = buttonProps && (buttonProps.itemSubType === 'line' || buttonProps.itemSubType === 'separator');

    const childItems = props.childItems && props.childItems.length > 0
        ? props.childItems.map(x => prepareItem(x, props.readOnly)).filter(getIsVisible)?.map((props) => createMenuItem(props, getIsVisible, appContext, prepareItem, form))
        : null;

    return isDivider
        ? { type: 'divider', style: { height: addPx(props.dividerWidth), backgroundColor: props.dividerColor } }
        : getButtonGroupMenuItem(
            <RenderButton props={props} uuid={props.id} appContext={appContext} form={form} />,
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
    form?: FormInstance<any>;
    styles?: CSSProperties;
}
const InlineItem: FC<InlineItemProps> = (props) => {
    const { item, uuid, getIsVisible, appContext, prepareItem, form } = props;

    if (isGroup(item)) {
        const menuItems = item.childItems.map(x => prepareItem(x, item.readOnly))
            .filter(item => (getIsVisible(item)))
            .map(childItem => (createMenuItem({ ...childItem, buttonType: childItem.buttonType ?? 'link' }, getIsVisible, appContext, prepareItem, form)));
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
                    className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable')}
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
                return <RenderButton props={{ ...item }} uuid={item.id} appContext={appContext} form={form} />;
            case 'separator':
            case 'line':
                return <Divider type='vertical' key={uuid} style={{ width: addPx(item.dividerWidth), backgroundColor: item.dividerColor }} />;
            default:
                return null;
        }
    }

    return null;
};

type ItemVisibilityFunc = (item: ButtonGroupItemProps) => boolean;

export const ButtonGroupInner: FC<IButtonGroupProps> = (props) => {
    const { styles } = useStyles();
    const allData = useAvailableConstantsData();
    const { anyOfPermissionsGranted } = useSheshaApplication();

    // ToDo: AS - review optimization
    const preparedItems = props.items?.map((item) => {
        // add editMode property if not exists
        const preparedItem = { ...item, editMode: typeof item['editMode'] === 'undefined' ? undefined : item['editMode'] };
        return getActualModel(preparedItem, allData, props.readOnly);
    });
    const items = useDeepCompareMemo(() => preparedItems, [preparedItems]);

    const { size, spaceSize = 'middle', isInline, readOnly: disabled, form } = props;

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

    const prepareItem: PrepareItemFunc = useCallback((item, parentReadOnly) => {
        if (item.editMode === undefined)
            item.editMode = 'inherited'; // prepare editMode property if not exist for updating inside getActualModel
        const result = getActualModel(item, allData, parentReadOnly);
        return { ...result };
    }, [allData]);

    const actualItems = useDeepCompareMemo(() => {
        return Promise.all(items?.map(async (item) => {
            return prepareItem({ ...item }, disabled);
        }) || []);
    }, [items, allData.contexts.lastUpdate, allData.data, allData.form?.formMode, allData.globalState, allData.selectedRow]);

    const [resolvedItems, setResolvedItems] = useState<ButtonGroupItemProps[]>([]);

    useEffect(() => {
        actualItems?.then(setResolvedItems);
    }, [actualItems]);

    const filteredItems = resolvedItems?.filter(getIsVisible);

    if (resolvedItems.length === 0 && isDesignMode)
        return (
            <Alert
                className="sha-designer-warning"
                message="Button group is empty. Press 'Customize Button Group' button to add items"
                type="warning"
            />
        );


    if (isInline) {
        return (
            <Button.Group size={size} style={{ ...props.styles, ...getOverflowStyle(true, false) }}>
                <Space size={spaceSize}>
                    {filteredItems?.map((item) =>
                        (<InlineItem styles={item?.styles} item={item} uuid={item.id} size={item.size} getIsVisible={getIsVisible} appContext={allData} key={item.id} prepareItem={prepareItem} form={form} />)
                    )}
                </Space>
            </Button.Group>
        );
    } else {
        const menuItems = filteredItems?.map((props) => createMenuItem(props, getIsVisible, allData, prepareItem, form));

        return (
            <div className={styles.shaResponsiveButtonGroupContainer}>
                <Menu
                    mode="horizontal"
                    items={menuItems}
                    className={classNames(styles.shaResponsiveButtonGroup, styles.a, `space-${spaceSize}`)}
                    style={{ ...props.styles, width: '30px', height: '30px' }}
                />
            </div>
        );
    }
};

export const ButtonGroup: FC<IButtonGroupProps> = (props) => {
    const items = useActualContextData(props.items, props.readOnly, null, standartActualModelPropertyFilter);

    const memoizedItems = useDeepCompareMemo(() => items, [items]);

    return (
        <DynamicActionsEvaluator items={memoizedItems}>
            {(items) => (<ButtonGroupInner {...props} items={items} />)}
        </DynamicActionsEvaluator>
    );
};