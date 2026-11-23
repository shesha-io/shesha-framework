import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { ITableComponentProps } from './models';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';
import { getShadowStyle } from '@/designer-components/_settings/utils/shadow/utils';
import { withFontFallback } from '@/designer-components/_settings/utils/font/utils';
import { getBackgroundImageUrl, getBackgroundStyle } from '@/designer-components/_settings/utils/background/utils';
import { useSheshaApplication } from '@/providers';
import { convertRowBorderStyleToBorder, convertRowDimensionsToHeight, convertRowPaddingFieldsToPadding, convertRowStylingBoxToPadding } from './utils';
import { isDefined } from '@/utils/nullables';
import { useStyles } from './styles';

/** A Data Table's resolved appearance, see {@link useTableAppearance}. */
export interface TableAppearance {
  wrapperClassName: string;
  wrapperStyle: CSSProperties;
  backgroundColor: string | undefined;
  headerFontFamily: string | undefined;
  headerFontSize: string | undefined;
  headerFontWeight: string | undefined;
  headerTextColor: string | undefined;
  headerTextAlign: string | undefined;
  bodyTextAlign: string | undefined;
  bodyFontFamily: string | undefined;
  bodyFontSize: string | undefined;
  bodyFontWeight: string | undefined;
  bodyFontColor: string | undefined;
  rowHeight: string | undefined;
  rowPadding: string | undefined;
  rowBorder: string | undefined;
  boxShadow: string | undefined;
}

/**
 * The appearance of a Data Table, resolved from its model (theme and component styles included):
 * the wrapper's class and style, and the values the table draws its header, rows and cells with.
 * Shared by the real table and the placeholder shown outside a Data Context, so both look the same.
 */
export const useTableAppearance = (props: ITableComponentProps): TableAppearance => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const calculatedStyles = useFormComponentStyles(props);
  const allStyles = props.allStyles ?? calculatedStyles;

  const shadowStyles = useMemo(() => getShadowStyle(props.shadow), [props.shadow]);

  const finalBoxShadow = useMemo(() => {
    return props.shadow ? shadowStyles.boxShadow : props.boxShadow;
  }, [props.shadow, shadowStyles.boxShadow, props.boxShadow]);

  const effectiveRowHeight = useMemo(() => {
    const converted = convertRowDimensionsToHeight(props.rowDimensions?.height);
    return converted || props.rowHeight;
  }, [props.rowDimensions, props.rowHeight]);

  const effectiveRowPadding = useMemo(() => {
    // Try new individual padding fields first
    const convertedFromFields = convertRowPaddingFieldsToPadding(
      props.rowPaddingTop,
      props.rowPaddingRight,
      props.rowPaddingBottom,
      props.rowPaddingLeft,
    );

    // Fall back to deprecated rowStylingBox for backward compatibility
    const convertedFromBox = convertRowStylingBoxToPadding(props.rowStylingBox);

    return convertedFromFields || convertedFromBox || props.rowPadding;
  }, [props.rowPaddingTop, props.rowPaddingRight, props.rowPaddingBottom, props.rowPaddingLeft, props.rowStylingBox, props.rowPadding]);

  const effectiveRowBorder = useMemo(() => {
    const converted = convertRowBorderStyleToBorder(props.rowBorderStyle);
    return converted || props.rowBorder;
  }, [props.rowBorderStyle, props.rowBorder]);

  // Compute effective header font values with backward compatibility
  const effectiveHeaderFontFamily = useMemo(() => {
    return withFontFallback(props.headerFont?.type ?? props.headerFontFamily);
  }, [props.headerFont?.type, props.headerFontFamily]);

  const effectiveHeaderFontSize = useMemo(() => {
    return props.headerFont?.size ? `${props.headerFont.size}px` : props.headerFontSize;
  }, [props.headerFont?.size, props.headerFontSize]);

  const effectiveHeaderFontWeight = useMemo(() => {
    return props.headerFont?.weight ?? props.headerFontWeight;
  }, [props.headerFont?.weight, props.headerFontWeight]);

  const effectiveHeaderTextColor = useMemo(() => {
    return props.headerFont?.color ?? props.headerTextColor;
  }, [props.headerFont?.color, props.headerTextColor]);

  const effectiveHeaderTextAlign = useMemo(() => {
    return props.headerFont?.align;
  }, [props.headerFont?.align]);

  const effectiveBodyTextAlign = useMemo(() => {
    return allStyles.fontStyles.textAlign ?? props.font?.align;
  }, [allStyles.fontStyles.textAlign, props.font?.align]);

  // State for stored file background URL
  const [storedFileBackgroundUrl, setStoredFileBackgroundUrl] = useState<string>('');

  // Fetch stored file URL when background type is 'storedFile'
  useEffect(() => {
    let isCancelled = false;

    const fetchStoredFileUrl = async (): Promise<void> => {
      if (isDefined(props.background) && props.background.type === 'storedFile' && props.background.storedFile?.id) {
        try {
          const url = await getBackgroundImageUrl(props.background, backendUrl, httpHeaders);
          if (!isCancelled) {
            setStoredFileBackgroundUrl(url);
          }
        } catch (error) {
          if (!isCancelled) {
            console.warn('Failed to fetch stored file background image:', error);
            setStoredFileBackgroundUrl('');
          }
        }
      } else {
        if (!isCancelled) {
          setStoredFileBackgroundUrl('');
        }
      }
    };

    fetchStoredFileUrl().catch((error) => {
      console.error('Failed to fetch stored file background image', error);
    });

    return () => {
      isCancelled = true;
    };
  }, [props.background, backendUrl, httpHeaders]);

  // Convert background object to CSS string
  const effectiveBackground = useMemo(() => {
    const bgStyles = getBackgroundStyle(props.background, undefined, storedFileBackgroundUrl);

    // Build complete background CSS string with all properties
    const parts: string[] = [];

    // Add image or color
    if (bgStyles.backgroundImage) {
      parts.push(bgStyles.backgroundImage);
    } else if (bgStyles.backgroundColor) {
      return bgStyles.backgroundColor; // Color doesn't need size/position
    }

    // Add position if present
    if (bgStyles.backgroundPosition) {
      parts.push(String(bgStyles.backgroundPosition));
    }

    // Add size if present (must come after position with / separator)
    if (bgStyles.backgroundSize) {
      // If position exists, add size with / separator, otherwise add it separately
      if (bgStyles.backgroundPosition) {
        parts[parts.length - 1] = `${parts[parts.length - 1]} / ${String(bgStyles.backgroundSize)}`;
      } else {
        parts.push(`/ ${String(bgStyles.backgroundSize)}`);
      }
    }

    // Add repeat if present
    if (bgStyles.backgroundRepeat) {
      parts.push(String(bgStyles.backgroundRepeat));
    }

    return parts.length > 0 ? parts.join(' ') : undefined;
  }, [props.background, storedFileBackgroundUrl]);

  const { styles } = useStyles({
    // Use resolved font styles from allStyles to properly handle device-specific styling
    fontFamily: allStyles.fontStyles.fontFamily ?? withFontFallback(props.font?.type),
    fontWeight: allStyles.fontStyles.fontWeight ?? props.font?.weight,
    textAlign: allStyles.fontStyles.textAlign ?? props.font?.align,
    color: allStyles.fontStyles.color ?? props.font?.color,
    fontSize: allStyles.fontStyles.fontSize
      ? parseInt(allStyles.fontStyles.fontSize as string, 10)
      : props.font?.size,
    striped: props.striped ?? false,
    hoverHighlight: props.hoverHighlight ?? false,
    rowBackgroundColor: props.rowBackgroundColor,
    rowAlternateBackgroundColor: props.rowAlternateBackgroundColor,
    rowHoverBackgroundColor: props.rowHoverBackgroundColor,
    rowSelectedBackgroundColor: props.rowSelectedBackgroundColor,
  });

  const finalStyle = useMemo(() => {
    let baseStyle;
    if (!props.enableStyleOnReadonly && props.readOnly) {
      baseStyle = {
        ...allStyles.fontStyles,
        ...allStyles.dimensionsStyles,
        ...allStyles.stylingBoxAsCSS,
      };
    } else {
      baseStyle = allStyles.fullStyle;
    }

    const {
      // Remove border properties if border prop is set
      border: borderProp,
      borderTop,
      borderRight,
      borderBottom,
      borderLeft,
      borderWidth,
      borderStyle: borderStyleProp,
      borderColor,
      borderRadius: borderRadiusProp,
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderTopStyle,
      borderRightStyle,
      borderBottomStyle,
      borderLeftStyle,
      borderTopColor,
      borderRightColor,
      borderBottomColor,
      borderLeftColor,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius,
      // Remove background properties to prevent duplicate application
      background,
      backgroundColor,
      backgroundImage,
      backgroundSize,
      backgroundPosition,
      backgroundRepeat,
      backgroundAttachment,
      backgroundOrigin,
      backgroundClip,
      ...styleWithoutBorderAndBackground
    } = baseStyle;

    // Only remove border properties if props.border is set
    if (props.border) {
      return styleWithoutBorderAndBackground;
    }

    // Remove background properties but keep border properties
    return {
      borderProp,
      borderTop,
      borderRight,
      borderBottom,
      borderLeft,
      borderWidth,
      borderStyle: borderStyleProp,
      borderColor,
      borderRadius: borderRadiusProp,
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderTopStyle,
      borderRightStyle,
      borderBottomStyle,
      borderLeftStyle,
      borderTopColor,
      borderRightColor,
      borderBottomColor,
      borderLeftColor,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius,
      ...styleWithoutBorderAndBackground,
    };
  }, [props.enableStyleOnReadonly, props.readOnly, allStyles, props.border]);

  const bodyFontFamily = allStyles.fontStyles.fontFamily ?? withFontFallback(props.font?.type);
  const bodyFontSize = allStyles.fontStyles.fontSize
    ? (allStyles.fontStyles.fontSize as string)
    : (props.font?.size ? `${props.font.size}px` : undefined);
  const bodyFontWeight = (allStyles.fontStyles.fontWeight ?? props.font?.weight) as string | undefined;
  const bodyFontColor = allStyles.fontStyles.color ?? props.font?.color as string;

  return {
    wrapperClassName: styles.dataTable,
    wrapperStyle: finalStyle,
    backgroundColor: effectiveBackground,
    headerFontFamily: effectiveHeaderFontFamily,
    headerFontSize: effectiveHeaderFontSize,
    headerFontWeight: effectiveHeaderFontWeight,
    headerTextColor: effectiveHeaderTextColor,
    headerTextAlign: effectiveHeaderTextAlign,
    bodyTextAlign: effectiveBodyTextAlign,
    bodyFontFamily,
    bodyFontSize,
    bodyFontWeight,
    bodyFontColor,
    rowHeight: effectiveRowHeight,
    rowPadding: effectiveRowPadding,
    rowBorder: effectiveRowBorder,
    boxShadow: finalBoxShadow,
  };
};
