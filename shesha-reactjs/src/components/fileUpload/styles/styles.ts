import { createStyles } from '@/styles';
import { addPx } from '@/utils/style';
import { CSSProperties } from 'react';
import { CSSInterpolation } from '@emotion/serialize';
import { isDefined } from '@/utils/nullables';
import { withFontFallback } from '@/designer-components/_settings/utils/font/utils';

interface ModelProps {
  layout?: boolean | undefined;
  isDragger?: boolean | undefined;
  hideFileName?: boolean | undefined;
  listType?: 'text' | 'picture' | 'picture-card' | 'thumbnail' | undefined;
}

interface FileUploadStylesParams {
  style?: CSSProperties | undefined;
  model: ModelProps;
}

type TextAlignType = 'left' | 'right' | 'center' | 'justify';

/**
 * Converts React CSSProperties to Emotion CSSInterpolation.
 * Spreading CSSProperties into a new object is safe at runtime and produces
 * a shape compatible with Emotion's CSSObject. The type assertion is necessary
 * because CSSInterpolation is a union type that doesn't directly accept the spread.
 */
const toCssInterpolation = (style: CSSProperties | undefined): CSSInterpolation => {
  return (style ? { ...style } : {}) as CSSInterpolation;
};

export type FileUploadStylesResponse = {
  shaStoredFilesRenderer?: string;
  storedFilesRendererBtnContainer?: string;
  storedFilesRendererNoFiles?: string;
  antUploadDragIcon?: string;
  antPreviewDownloadIcon?: string;
  thumbnailControls?: string;
  overlayThumbnailControls?: string;
  antUploadText?: string;
  antUploadHint?: string;
  styledFileControls?: string;
};

export const useStyles = createStyles<FileUploadStylesParams, FileUploadStylesResponse>(({ token, css, cx, prefixCls }, { style, model }) => {
  const {
    background = 'transparent',
    backgroundImage,
    borderRadius = '8px',
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    borderWidth = '0',
    borderTopWidth,
    width,
    minWidth,
    maxWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderLeftColor,
    borderLeftStyle,
    borderRightColor,
    borderRightStyle,
    borderColor = '#d9d9d9',
    borderTopStyle,
    borderTopColor,
    boxShadow,
    borderBottomColor,
    borderBottomStyle,
    borderRightWidth,
    backgroundColor,
    borderStyle = 'solid',
    color,
    fontFamily = withFontFallback('Segoe UI'),
    fontSize = '25px',
    fontWeight = '400',
    height,
    maxHeight,
    minHeight,
    textAlign = 'left',
  } = style || {};

  const { layout: layoutProp, isDragger, hideFileName, listType } = model;
  /**
   * First of the candidates that is actually set. CSS values treat an empty string as "not set", so
   * `??` is not enough here — but a bare `||` chain is an implicit truthiness test on a nullable
   * string, which is exactly what strict-boolean-expressions flags. This states the intent once.
   */
  const firstSet = (...values: (string | number | undefined)[]): string =>
    values.find((value) => isDefined(value) && String(value).trim() !== '')?.toString() ?? '';
  // Normalised once so the many CSS conditionals below are strict-boolean checks rather than
  // repeating `=== true` at every interpolation.
  const layout = layoutProp === true;

  const styleProvided = isDefined(style) && Object.keys(style).length > 0;

  const isThumbnail = listType === 'thumbnail' && isDragger !== true;
  const extraStyles = isThumbnail ? toCssInterpolation(style) : {};

  const justifyContentMap: Record<TextAlignType, string> = {
    left: 'flex-start',
    right: 'flex-end',
    center: 'center',
    justify: 'space-between',
  };

  const textAlignValue = (typeof textAlign === 'string' ? textAlign : 'left') as TextAlignType;
  const justifyContentValue = justifyContentMap[textAlignValue] || textAlignValue;

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const antUploadText = `${prefixCls}-upload-text`;
  const antUploadHint = `${prefixCls}-upload-hint`;

  const storedFilesRendererBtnContainer = 'stored-files-renderer-btn-container';
  const storedFilesRendererNoFiles = 'stored-files-renderer-no-files';

  const normalizeRadius = (value: unknown): string => {
    const scalar = typeof value === 'string' || typeof value === 'number'
      ? value
      : typeof borderRadius === 'string' || typeof borderRadius === 'number'
        ? borderRadius
        : undefined;
    return addPx(scalar) ?? '0';
  };
  const borderRadiusCss = `
    border-top-left-radius: ${normalizeRadius(borderTopLeftRadius)} !important;
    border-top-right-radius: ${normalizeRadius(borderTopRightRadius)} !important;
    border-bottom-right-radius: ${normalizeRadius(borderBottomRightRadius)} !important;
    border-bottom-left-radius: ${normalizeRadius(borderBottomLeftRadius)} !important;
  `;

  const commonBorderStyles = `
    border: ${borderWidth} ${borderStyle} ${borderColor};
    border-right: ${firstSet(borderRightWidth, borderWidth)} ${firstSet(borderRightStyle, borderStyle)}
      ${firstSet(borderRightColor, borderColor)};
    border-left: ${firstSet(borderLeftWidth, borderWidth)} ${firstSet(borderLeftStyle, borderStyle)} ${firstSet(borderLeftColor, borderColor)};
    border-bottom: ${firstSet(borderBottomWidth, borderWidth)} ${firstSet(borderBottomStyle, borderStyle)}
      ${firstSet(borderBottomColor, borderColor)};
    border-top: ${firstSet(borderTopWidth, borderWidth)} ${firstSet(borderTopStyle, borderStyle)} ${firstSet(borderTopColor, borderColor)};
    ${borderRadiusCss}
    ${isDefined(boxShadow) ? `box-shadow: ${boxShadow};` : ''}
  `;

  /* The empty/upload tile takes the font family only — never colour, size, weight or alignment,
     which would make it read as content, and never the box appearance. `style` is the whole computed
     style, so it is narrowed here rather than interpolated wholesale. */
  const uploadTileFontCss = isThumbnail ? `font-family: ${fontFamily};` : '';

  // Border/radius emitted only when the caller supplied a style; otherwise the component class owns
  // the box appearance (see the note on styleProvided above).
  const ownedBorderStyles = styleProvided ? commonBorderStyles : '';

  /* Colour is emitted only when the caller's style actually carries one — not merely when it carries
     something. A style that sets only a background still counts as provided, and a fallback colour
     stated on that basis lands on the very elements the component class puts the configured Font
     colour on, and outranks it. So the fallback is dropped rather than gated: unset, colour belongs
     to the class, and to antd where there is no class. Where the caller does state a colour it still
     wins, which is the precedence every other style set here uses. */
  const customColor = firstSet(color);
  const customColorCss = customColor === '' ? '' : `color: ${customColor};`;
  const customColorImportantCss = customColor === '' ? '' : `color: ${customColor} !important;`;

  // The rest of the text styling falls back to hardcoded defaults (25px Segoe UI) when no style is
  // supplied. On the component-class path that would override the configured Font, so emit nothing
  // and let the class own the text as well as the box.
  const commonTextStyles = styleProvided
    ? `
    ${customColorCss}
    font-family: ${fontFamily};
    font-size: ${fontSize};
    font-weight: ${fontWeight};
    text-align: ${textAlign};
  `
    : '';
  const shaStoredFilesRenderer = cx(
    'sha-stored-files-renderer',
    css`
      /* firstSet, not nullish-coalescing: these come from caller-supplied CSSProperties, where a
         dimension can be an empty string. Nullish-coalescing would pass that through, and a custom
         property that is set but empty does NOT activate the var() fallback at the use site — it
         just yields an invalid declaration. firstSet treats empty as unset, as CSS does. */
      --thumbnail-width: ${layout ? firstSet(width, height, '54px') : '100%'};
      --thumbnail-height: ${layout ? firstSet(height, width, '54px') : '100%'};
      ${styleProvided ? `
      --ant-border-radius-xs: ${borderRadius} !important;
      --ant-border-radius-sm: ${borderRadius} !important;
      --ant-border-radius-lg: ${borderRadius} !important;
      ` : ''}
      ${styleProvided ? `
      --ant-button-content-font-size: ${fontSize} !important;
      --ant-button-font-weight: ${fontWeight} !important;
      --ant-font-family: ${fontFamily} !important;
      ` : ''}
      /* Container must be a block box: it wraps block-level upload content (e.g. the Dragger),
         and as an inline <span> width/height:100% are ignored, so the content overflows and
         overlaps sibling fields. */
      display: block;
      ${styleProvided ? `
      height: ${layout ? firstSet(height, '54px') : '100%'} !important;
      width: ${layout ? firstSet(width, '54px') : '100%'} !important;
      max-height: ${layout ? firstSet(maxHeight, 'auto') : '100%'} !important;
      min-height: ${layout ? firstSet(minHeight, 'auto') : '100%'} !important;
      max-width: ${layout ? firstSet(maxWidth, 'auto') : '100%'} !important;
      min-width: ${layout ? firstSet(minWidth, 'auto') : '100%'} !important;
      ` : `
      /* The component class sizes the tile. The container wraps the tile *and* the single-line file
         name below it, so it takes the tile width (which is what the name ellipsises against) while
         its height grows to fit the extra name line. Pinning the height here instead would make the
         tile shrink when the name is shown. */
      height: auto;
      width: ${layout ? 'fit-content' : '100%'};
      `}
      ${isThumbnail ? `
        display: flex;
        flex-direction: column;
      .ant-upload-list-picture-card {
        min-height: 0 !important;
      }

      .ant-upload-list-item-container {
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        display: inline-block !important;
      }

      .ant-upload-list-item-container > div {
        ${styleProvided ? 'width: 100%; height: 100%;' : 'width: 100%; height: auto;'}
        display: flex;
        flex-direction: column;
      }

      /* The empty/upload tile takes the dimensions and the font family only. It is a control to
         click rather than content to look at, so the configured background, border and shadow are
         deliberately not emitted here — unlike the filled tile below, which keeps the full box
         appearance. The computed style is the whole box (background included), so only its font
         family is taken here rather than interpolating it wholesale. */
      .${prefixCls}-upload-select,
      .${prefixCls}-upload.${prefixCls}-upload-select {
        ${styleProvided ? `
        width: var(--thumbnail-width) !important;
        height: var(--thumbnail-height) !important;
        ` : ''}
        margin: 0 !important;
        box-sizing: border-box !important;
        ${uploadTileFontCss}
      }

      >.thumbnail-stub {
        padding: 0 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        /* The designer stub stands in for a *filled* tile — it previews how an attached file will
           look — so it takes the full configured appearance, unlike .ant-upload-select above. When
           the component class supplies the appearance and dimensions, this hook emits neither, so
           the class is not outranked here. */
        ${styleProvided ? `
        background: ${firstSet(backgroundImage, backgroundColor, background)};
        width: 100% !important;
        height: 100% !important;
        ` : ''}
        display: flex !important;
        align-items: center !important;
        ${extraStyles}
        ${ownedBorderStyles}
        ${commonTextStyles}
      }

      .${prefixCls}-upload-select .${prefixCls}-upload {
        width: 100% !important;
        height: 100% !important;
      }
      ` : ''}


      .ant-upload-list-item-image {
        object-fit: contain !important;
        width: 100% !important;
        height: 100% !important;
      }

      .ant-upload:not(.ant-upload-disabled) {
        .icon {
          color: ${firstSet(color, token.colorPrimary)} !important;
        }
      }

      .ant-upload-list-item {
        --ant-line-width: 0px !important;
        --ant-padding-xs: 0px !important;
        --font-size: ${fontSize} !important;
        --ant-font-size: ${fontSize} !important;
        display: flex;
        ${isThumbnail && styleProvided ? `

        :before {
          top: 0;
          width: 100% !important;
          ${borderRadiusCss}
          border: ${borderWidth} ${borderStyle} ${borderColor} !important;
          height: 100% !important;
        }
        ` : ''}
      }

      .ant-upload-list-item-thumbnail {
        ${extraStyles}
        box-sizing: border-box !important;
        padding: 0 !important;
        ${ownedBorderStyles}
      }

      /* The file name is a single line under the tile, ellipsised at the tile width. It takes only
         text styling — the configured border/background/shadow/dimensions belong to the tile, not to
         the name — and it is laid out identically whether or not it is shown, so hiding it never
         changes the tile size. */
      .thumbnail-item-name {
        ${commonTextStyles}
        ${isThumbnail ? (hideFileName === true ? 'display: none !important;' : `
        display: block;
        width: 100%;
        max-width: 100%;
        height: 32px;
        line-height: 32px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        `) : ''}

        a {
          ${commonTextStyles}
          ${isThumbnail ? `
          display: inline-block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          ` : ''}
        }
        .ant-space {
          .anticon {
            color: ${color} !important;
          }
        }
      }

      .ant-upload-list-text {
        ${commonTextStyles}
      }

      .ant-upload-drag:hover:not(.ant-upload-disabled) {
        border-color: ${token.colorPrimary} !important;
      }

      .${prefixCls}-upload {
        ${isDragger === true ? `min-height: ${minHeight ?? '120px'} !important;` : ''}
        ${borderRadiusCss}
        align-items: center;

        &.${prefixCls}-upload-btn {
          .${prefixCls}-upload-drag-icon {
            margin: unset;
          }

          .ant-upload-select {
            align-content: center;
          }
        }
      }

      ${listType !== 'thumbnail' ? `
        .ant-upload-select {
          border: none !important;
        }
      ` : ''}

      .ant-btn {
        /* Only the caller's own colour, for the reason given where customColor is derived: stating a
           fallback here — !important, so specificity could not settle it — overrode the Font colour
           the component class puts on this very button, which is why Font colour did nothing to the
           upload prompt. Unset, the button falls back to the class, then to antd's link colour. */
        ${customColorImportantCss}
        ${commonTextStyles}
        justify-content: ${layout ? 'center' : justifyContentValue} !important;
        align-items: center;
        padding: 0;
        * {
          ${commonTextStyles}
        }
        width: 100% !important;
        height: 100% !important;
        border: none !important;
        background: transparent !important;
      }

      .ant-upload-list-item-container {
        margin: 0 !important;
        padding: 0 !important;
        &.ant-upload-animate-inline-appear,
        &.ant-upload-animate-inline-appear-active,
        &.ant-upload-animate-inline {
          display: none !important;
          animation: none !important;
          transition: none !important;
        }
      }
    `,
  );

  const antPreviewDownloadIcon = cx(
    'ant-preview-download-icon',
    css`
      background: #0000001a;
      font-size: 24px;
      padding: 8px;
      border-radius: 100px;
      :hover {
        color: #fff;
      }
    `,
  );

  const thumbnailControls = cx(
    'thumbnail-controls',
    css`
      width: 100% !important;
      height: 100% !important;
      /* No radius of its own. The tile (.styled-file-controls) already carries the configured radius
         and clips with overflow: hidden, so repeating it here rounds a second box *inside* the
         first: the inner curve does not follow the inner edge of the tile's border, and the
         mismatch shows as slivers of background at each corner. Clipping is inherited from the
         tile, so the image still ends up rounded. */
      display: block !important;
      overflow: hidden !important;

      .ant-image-img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
      }
    `,
  );

  const overlayThumbnailControls = cx(
    'overlay-thumbnail-controls',
    css`
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      /* Fill the positioned thumbnail tile exactly instead of re-deriving width/height (an empty
         configured dimension would collapse the overlay and push it off to the side). */
      height: 100% !important;
      width: 100% !important;
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      justify-content: center;
      align-items: center;

      .ant-space {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(24px, auto)) !important;
        gap: 4px !important;
        place-items: center !important;
        place-content: center !important;
      }

      &:hover {
        opacity: 1;
      }
    `,
  );

  const styledFileControls = cx(
    'styled-file-controls',
    css`
      ${ownedBorderStyles}
      ${commonTextStyles}
      padding: 0 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      /* This is the thumbnail tile: it takes the configured background/border/dimensions. When the
         component class supplies them, this hook emits nothing here so the class is not outranked by
         these !important declarations. */
      ${styleProvided ? `
      background: ${firstSet(backgroundImage, backgroundColor, background)};
      width: var(--thumbnail-width, ${firstSet(width, '54px')}) !important;
      height: var(--thumbnail-height, ${firstSet(height, '54px')}) !important;
      ` : ''}
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;

      .ant-image  {
        object-fit: cover !important;
        width: 100% !important;
        height: 100% !important;
        img {
          object-fit: cover !important;
          
        }
      }

      .anticon {
        img {
          object-fit: cover !important;
        }
      }
      ${extraStyles}
    `,
  );

  return {
    shaStoredFilesRenderer,
    storedFilesRendererBtnContainer,
    storedFilesRendererNoFiles,
    antUploadDragIcon,
    antPreviewDownloadIcon,
    thumbnailControls,
    overlayThumbnailControls,
    antUploadText,
    antUploadHint,
    styledFileControls,
  };
});
