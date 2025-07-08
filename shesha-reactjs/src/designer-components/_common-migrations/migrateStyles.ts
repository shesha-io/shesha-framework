import { nanoid } from "@/utils/uuid";
import { addPx } from '@/utils/style';
import { ICommonContainerProps, IConfigurableFormComponent, IInputStyles, IStyleType } from "@/interfaces";

type ExtendedType = IInputStyles & Omit<IConfigurableFormComponent, 'type' | 'id'> & { block?: boolean; type?: string };

const inputTypes = ['textField', 'numberField', 'passwordCombo', 'dropdown', 'autocomplete', 'timePicker', 'dateField', 'button', 'entityPicker'];
const isInputField = (prev: ExtendedType) => inputTypes.includes(prev.type);
export const migrateStyles = <T extends ExtendedType>(prev: T, defaults?: Omit<ICommonContainerProps, 'style' | 'id' | 'label'>, screen?: 'desktop' | 'tablet' | 'mobile'): IStyleType => {
    const prevStyles: IInputStyles = screen && prev[`${screen}`] ? prev[`${screen}`] : prev;

    const border = (side) => ({
        ...prev?.border?.border?.[side],
        width: prevStyles?.borderSize ?? prevStyles?.borderWidth ?? prev?.border?.border?.[side]?.width ?? defaults?.border?.border?.[side]?.width,
        style: prevStyles?.borderType ?? prevStyles?.borderStyle ?? prev?.border?.border?.[side]?.style ?? defaults?.border?.border?.[side]?.style,
        color: prevStyles?.borderColor ?? prev?.border?.border?.[side]?.color ?? defaults?.border?.border?.[side]?.color
    });

    const heightFromSize = !isInputField(prev) ? null : prevStyles?.size === 'small' ? '24px' : prevStyles?.size === 'large' ? '40px' : null;
    const fontSizeFromSize = prevStyles?.size === 'small' ? 14 : prevStyles?.size === 'large' ? 16 : null;
    const isColor = prevStyles.backgroundType === 'color' || prev.backgroundType === 'color';
    const isBase64 = prevStyles.backgroundDataSource === 'base64' || prev.backgroundDataSource === 'base64';
    const isUrl = prevStyles.backgroundDataSource === 'url' || prev.backgroundDataSource === 'url';
    const isStoredFile = prevStyles.backgroundDataSource === 'storedFileId' || prev.backgroundDataSource === 'storedFileId';

    const backgroundType = isColor ? 'color' : isBase64 ? 'image' : isUrl ? 'url' : isStoredFile ? 'storedFile' : 'color';
    const backgroundUrl = prevStyles.backgroundUrl || prev.backgroundUrl;
    const backgroundBase64 = prevStyles.backgroundBase64 || prev.backgroundBase64;
    const backgroundStoredFileId = prevStyles.backgroundStoredFileId || prev.backgroundStoredFileId;
    const backgroundColor = prevStyles.backgroundColor || prev.backgroundColor;
    const backgroundRepeat = prevStyles.backgroundRepeat || prev.backgroundRepeat;
    const backgroundCover = prevStyles.backgroundCover || prev.backgroundCover;

    return {
        size: prevStyles?.size,
        border: {
            hideBorder: prevStyles?.hideBorder || defaults?.hideBorder || false,
            radiusType: defaults?.border?.radiusType || 'all',
            borderType: defaults?.border?.borderType || 'all',
            border: {
                all: border('all'),
                top: border('top'),
                bottom: border('bottom'),
                left: border('left'),
                right: border('right'),
            },
            radius: {
                all: prevStyles?.borderRadius || defaults?.border?.radius?.all,
                topLeft: defaults?.border?.radius?.topLeft,
                topRight: defaults?.border?.radius?.topRight,
                bottomLeft: defaults?.border?.radius?.bottomLeft,
                bottomRight: defaults?.border?.radius?.bottomRight
            },
        },
        background: {
            type: backgroundType,
            color: backgroundColor || defaults?.background?.color,
            repeat: backgroundRepeat || defaults?.background?.repeat || 'no-repeat',
            size: backgroundCover || defaults?.background?.size || 'auto',
            position: 'center',
            gradient: { direction: 'to right', colors: {} },
            url: backgroundUrl || defaults?.background?.url || '',
            storedFile: { id: backgroundStoredFileId || null },
            uploadFile: backgroundBase64 ? { uid: nanoid(), name: '', url: backgroundBase64 } : null,
        },
        font: {
            color: prevStyles?.fontColor || prevStyles.color || defaults?.font?.color,
            type: prevStyles?.font?.type || defaults?.font?.type,
            align: prevStyles?.font?.align || defaults?.font?.align || 'left',
            size: prevStyles?.fontSize as number || fontSizeFromSize || defaults?.font?.size,
            weight: prevStyles?.fontWeight as string || defaults?.font?.weight || '400',
        },
        dimensions: {
            width: prev.block ? '100%' : addPx(prevStyles?.width) ?? addPx(prev?.width) ?? addPx(prev?.dimensions?.width) ?? defaults?.dimensions?.width,
            height: addPx(prevStyles?.height) ?? addPx(prev?.height) ?? heightFromSize ?? addPx(prev?.dimensions?.height) ?? defaults?.dimensions?.height,
            minHeight: addPx(prev?.dimensions?.minHeight) ?? defaults?.dimensions?.minHeight,
            maxHeight: addPx(prev?.dimensions?.maxHeight) ?? defaults?.dimensions?.maxHeight,
            minWidth: addPx(prev?.dimensions?.minWidth) ?? defaults?.dimensions?.minWidth,
            maxWidth: addPx(prev?.dimensions?.maxWidth) ?? defaults?.dimensions?.maxWidth,
        },
        shadow: {
            offsetX: defaults?.shadow?.offsetX || 0,
            offsetY: defaults?.shadow?.offsetY || 0,
            color: defaults?.shadow?.color || '#000',
            blurRadius: defaults?.shadow?.blurRadius || 0,
            spreadRadius: defaults?.shadow?.spreadRadius || 0
        },
        ...(defaults?.display && { display: defaults?.display || 'block' }),
        stylingBox: prev?.stylingBox || defaults?.stylingBox || '{}',
    };
};

export const migratePrevStyles = <T extends ExtendedType>(prev: T, defaults?: Omit<ICommonContainerProps, 'style' | 'id' | 'label'>) => {


    const result: T = {
        ...prev,
        desktop: { ...prev.desktop, ...migrateStyles(prev, defaults, 'desktop') },
        tablet: { ...prev.tablet, ...migrateStyles(prev, defaults, 'tablet') },
        mobile: { ...prev.mobile, ...migrateStyles(prev, defaults, 'mobile') },
    };

    return result;

};