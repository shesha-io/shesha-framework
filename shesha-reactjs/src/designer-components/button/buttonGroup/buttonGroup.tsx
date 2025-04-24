import React, { CSSProperties, FC, useCallback, useEffect, useMemo, useState } from 'react';
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
import { useDeepCompareMemo } from '@/hooks';
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

type MenuItem = MenuProps['items'][number];

type PrepareItemFunc = (item: ButtonGroupItemProps, parentReadOnly: boolean) => ButtonGroupItemProps;

type MenuButton = ButtonGroupItemProps & {
    childItems?: MenuButton[];
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
        ? { type: 'divider' }
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
                return <Divider type='vertical' key={uuid} />;
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
    const { anyOfPermissionsGranted, backendUrl, httpHeaders } = useSheshaApplication();

    const { items, size, spaceSize = 'middle', isInline, readOnly: disabled, form, dimensions, shadow, border, background, style, stylingBox } = props;
    const jsStyle = getStyle(style, props);

    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    useEffect(() => {
        const fetchStyles = async () => {
            const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
                ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
                    { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
                    .then((response) => {
                        return response.blob();
                    })
                    .then((blob) => {
                        return URL.createObjectURL(blob);
                    }) : '';

            const bgStyle = getBackgroundStyle(background, jsStyle, storedImageUrl);

            setBackgroundStyles((prevStyles) => {
                if (JSON.stringify(prevStyles) !== JSON.stringify(bgStyle)) {
                    return bgStyle;
                }
                return prevStyles;
            });
        };

        fetchStyles();
    }, [background, backendUrl, httpHeaders, jsStyle]);

    const styling = JSON.parse(stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles = removeUndefinedProps({
        ...dimensionsStyles,
        ...borderStyles,
        ...backgroundStyles,
        ...shadowStyles,
        ...stylingBoxAsCSS,
        ...jsStyle
    });

    const finalStyle = removeUndefinedProps({ ...additionalStyles });


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
            const jsStyle = getStyle(item.style);
            const dimensions = item?.dimensions;
            const border = item?.border;
            const font = item?.font;
            const shadow = item?.shadow;
            const background = item.background;

            const dimensionsStyles = getDimensionsStyle(dimensions);
            const borderStyles = getBorderStyle(border, jsStyle);
            const fontStyles = getFontStyle(font);
            const shadowStyles = getShadowStyle(shadow);

            const storedImageUrl = await getBackgroundImageUrl(background, backendUrl, httpHeaders);

            const backgroundStyle = getBackgroundStyle(item.background, getStyle(item.style), storedImageUrl);

            const newStyles = {
                ...dimensionsStyles,
                ...(['primary', 'default'].includes(item.buttonType) && borderStyles),
                ...fontStyles,
                ...(['primary', 'default'].includes(item.buttonType) && shadowStyles),
                ...(['dashed', 'default'].includes(item.buttonType) && backgroundStyle),
                ...jsStyle,
                justifyContent: font?.align,
            };

            return prepareItem({ ...item, styles: newStyles }, disabled);
        }) || []);
    }, [items, allData.contexts.lastUpdate, allData.data, allData.form?.formMode, allData.globalState, allData.selectedRow]);

    const [resolvedItems, setResolvedItems] = useState<ButtonGroupItemProps[]>([]);

    useEffect(() => {
        actualItems?.then(setResolvedItems);
    }, [actualItems]);

    const filteredItems = resolvedItems?.filter(getIsVisible);

    if (background?.type === 'storedFile' && background.storedFile?.id && !isValidGuid(background.storedFile.id)) {
        return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

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
            <Button.Group size={size} style={finalStyle}>
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
            <div className={styles.shaResponsiveButtonGroupContainer} style={finalStyle}>
                <Menu
                    mode="horizontal"
                    items={menuItems}
                    className={classNames(styles.shaResponsiveButtonGroup, styles.a, `space-${spaceSize}`)}
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