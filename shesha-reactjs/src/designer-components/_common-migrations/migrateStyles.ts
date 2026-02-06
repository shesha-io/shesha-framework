import { nanoid } from "@/utils/uuid";
import { addPx } from '@/utils/style';
import { ICommonContainerProps, IConfigurableFormComponent, IInputStyles, IStyleType } from "@/interfaces";
import { IBorderType } from "../_settings/utils/border/interfaces";

type ExtendedType = IInputStyles & Omit<IConfigurableFormComponent, 'type' | 'id'> & { block?: boolean; type?: string };

type BorderCssProps = {
  width: string | number | undefined;
  style: IBorderType | undefined;
  color: string | undefined;
};

const inputTypes = ['textField', 'numberField', 'passwordCombo', 'dropdown', 'autocomplete', 'timePicker', 'dateField', 'button', 'entityPicker'];
const isInputField = (prev: ExtendedType): boolean => inputTypes.includes(prev.type);
export const migrateStyles = <T extends ExtendedType>(prev: T, defaults?: Omit<ICommonContainerProps, 'style' | 'id' | 'label'>, screen?: 'desktop' | 'tablet' | 'mobile'): IStyleType => {
  const prevStyles: IInputStyles = screen && prev[`${screen}`] ? prev[`${screen}`] : prev;

  const border = (side: string): BorderCssProps => ({
    ...defaults?.border?.border?.[side],
    ...prev?.border?.border?.[side],
    ...prevStyles?.border?.border?.[side],
    width: prevStyles?.border?.border?.[side]?.width ?? prevStyles?.borderSize ?? prevStyles?.borderWidth ?? prev?.border?.border?.[side]?.width ?? defaults?.border?.border?.[side]?.width,
    style: prevStyles?.border?.border?.[side]?.style ?? prevStyles?.borderType ?? prevStyles?.borderStyle ?? prev?.border?.border?.[side]?.style ?? defaults?.border?.border?.[side]?.style,
    color: prevStyles?.border?.border?.[side]?.color ?? prevStyles?.borderColor ?? prev?.border?.border?.[side]?.color ?? defaults?.border?.border?.[side]?.color,
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
    size: prevStyles?.size ?? prev?.size,
    border: {
      hideBorder: prevStyles?.hideBorder ?? prev?.hideBorder ?? defaults?.hideBorder ?? false,
      radiusType: prevStyles?.border?.radiusType ?? prev?.border?.radiusType ?? defaults?.border?.radiusType ?? 'all',
      borderType: prevStyles?.border?.borderType ?? prev?.border?.borderType ?? defaults?.border?.borderType ?? 'all',
      border: {
        all: border('all'),
        top: border('top'),
        bottom: border('bottom'),
        left: border('left'),
        right: border('right'),
      },
      radius: {
        all: prevStyles?.border?.radius?.all ?? prevStyles?.borderRadius ?? prev?.border?.radius?.all ?? prev?.borderRadius ?? defaults?.border?.radius?.all,
        topLeft: prevStyles?.border?.radius?.topLeft ?? prev?.border?.radius?.topLeft ?? defaults?.border?.radius?.topLeft,
        topRight: prevStyles?.border?.radius?.topRight ?? prev?.border?.radius?.topRight ?? defaults?.border?.radius?.topRight,
        bottomLeft: prevStyles?.border?.radius?.bottomLeft ?? prev?.border?.radius?.bottomLeft ?? defaults?.border?.radius?.bottomLeft,
        bottomRight: prevStyles?.border?.radius?.bottomRight ?? prev?.border?.radius?.bottomRight ?? defaults?.border?.radius?.bottomRight,
      },
    },
    background: {
      type: prevStyles?.background?.type ?? prev?.background?.type ?? backgroundType,
      color: prevStyles?.background?.color ?? prev?.background?.color ?? backgroundColor ?? defaults?.background?.color,
      repeat: prevStyles?.background?.repeat ?? prev?.background?.repeat ?? backgroundRepeat ?? defaults?.background?.repeat ?? 'no-repeat',
      size: prevStyles?.background?.size ?? prev?.background?.size ?? backgroundCover ?? defaults?.background?.size ?? 'auto',
      position: prevStyles?.background?.position ?? prev?.background?.position ?? 'center',
      gradient: prevStyles?.background?.gradient ?? prev?.background?.gradient ?? { direction: 'to right', colors: {} },
      url: prevStyles?.background?.url ?? prev?.background?.url ?? backgroundUrl ?? defaults?.background?.url ?? '',
      storedFile: prevStyles?.background?.storedFile ?? prev?.background?.storedFile ?? { id: backgroundStoredFileId || null },
      uploadFile: prevStyles?.background?.uploadFile ?? prev?.background?.uploadFile ?? (backgroundBase64 ? { uid: nanoid(), name: '', url: backgroundBase64 } : null),
    },
    font: {
      color: prevStyles?.font?.color ?? prevStyles?.fontColor ?? prevStyles?.color ?? prev?.font?.color ?? prev?.fontColor ?? prev?.color ?? defaults?.font?.color,
      type: prevStyles?.font?.type ?? prev?.font?.type ?? defaults?.font?.type,
      align: prevStyles?.font?.align ?? prev?.font?.align ?? defaults?.font?.align ?? 'left',
      size: prevStyles?.font?.size ?? (prevStyles?.fontSize as number) ?? prev?.font?.size ?? (prev?.fontSize as number) ?? fontSizeFromSize ?? defaults?.font?.size,
      weight: prevStyles?.font?.weight ?? (prevStyles?.fontWeight as string) ?? prev?.font?.weight ?? (prev?.fontWeight as string) ?? defaults?.font?.weight ?? '400',
    },
    dimensions: {
      width: prevStyles?.dimensions?.width ?? prev?.dimensions?.width ?? (prev?.block ? '100%' : (addPx(prevStyles?.width) ?? addPx(prev?.width) ?? defaults?.dimensions?.width)),
      height: prevStyles?.dimensions?.height ?? prev?.dimensions?.height ?? addPx(prevStyles?.height) ?? addPx(prev?.height) ?? heightFromSize ?? defaults?.dimensions?.height,
      minHeight: prevStyles?.dimensions?.minHeight ?? prev?.dimensions?.minHeight ?? defaults?.dimensions?.minHeight,
      maxHeight: prevStyles?.dimensions?.maxHeight ?? prev?.dimensions?.maxHeight ?? defaults?.dimensions?.maxHeight,
      minWidth: prevStyles?.dimensions?.minWidth ?? prev?.dimensions?.minWidth ?? defaults?.dimensions?.minWidth,
      maxWidth: prevStyles?.dimensions?.maxWidth ?? prev?.dimensions?.maxWidth ?? defaults?.dimensions?.maxWidth,
    },
    shadow: {
      offsetX: prevStyles?.shadow?.offsetX ?? prev?.shadow?.offsetX ?? defaults?.shadow?.offsetX ?? 0,
      offsetY: prevStyles?.shadow?.offsetY ?? prev?.shadow?.offsetY ?? defaults?.shadow?.offsetY ?? 0,
      color: prevStyles?.shadow?.color ?? prev?.shadow?.color ?? defaults?.shadow?.color ?? '#000',
      blurRadius: prevStyles?.shadow?.blurRadius ?? prev?.shadow?.blurRadius ?? defaults?.shadow?.blurRadius ?? 0,
      spreadRadius: prevStyles?.shadow?.spreadRadius ?? prev?.shadow?.spreadRadius ?? defaults?.shadow?.spreadRadius ?? 0,
    },
    menuItemShadow: {
      offsetX: prevStyles?.menuItemShadow?.offsetX ?? prev?.menuItemShadow?.offsetX ?? defaults?.menuItemShadow?.offsetX ?? 0,
      offsetY: prevStyles?.menuItemShadow?.offsetY ?? prev?.menuItemShadow?.offsetY ?? defaults?.menuItemShadow?.offsetY ?? 0,
      color: prevStyles?.menuItemShadow?.color ?? prev?.menuItemShadow?.color ?? defaults?.menuItemShadow?.color ?? '#000',
      blurRadius: prevStyles?.menuItemShadow?.blurRadius ?? prev?.menuItemShadow?.blurRadius ?? defaults?.menuItemShadow?.blurRadius ?? 0,
      spreadRadius: prevStyles?.menuItemShadow?.spreadRadius ?? prev?.menuItemShadow?.spreadRadius ?? defaults?.menuItemShadow?.spreadRadius ?? 0,
    },
    overflow: prevStyles?.overflow ?? prev?.overflow ?? defaults?.overflow,
    ...(defaults?.display && { display: defaults?.display || 'block' }),
    stylingBox: prevStyles?.stylingBox ?? prev?.stylingBox ?? defaults?.stylingBox ?? '{}',
  };
};

export const migratePrevStyles = <T extends ExtendedType>(prev: T, defaults?: Omit<ICommonContainerProps, 'style' | 'id' | 'label'>): T => {
  const result: T = {
    ...prev,
    enableStyleOnReadonly: prev.enableStyleOnReadonly || false,
    desktop: { ...prev.desktop, ...migrateStyles(prev, defaults, 'desktop'), enableStyleOnReadonly: prev.desktop?.enableStyleOnReadonly || false },
    tablet: { ...prev.tablet, ...migrateStyles(prev, defaults, 'tablet'), enableStyleOnReadonly: prev.tablet?.enableStyleOnReadonly || false },
    mobile: { ...prev.mobile, ...migrateStyles(prev, defaults, 'mobile'), enableStyleOnReadonly: prev.mobile?.enableStyleOnReadonly || false },
  };

  return result;
};
