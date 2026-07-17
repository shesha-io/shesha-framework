import { createStyles } from '@/styles';
import { addPx } from '@/utils/style';
import { CSSProperties } from 'react';
import { CSSInterpolation } from '@emotion/serialize';

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
    fontFamily = 'Segoe UI',
    fontSize = '25px',
    fontWeight = '400',
    height,
    maxHeight,
    minHeight,
    textAlign = 'left',
  } = style || {};

  const { layout, isDragger, hideFileName, listType } = model;

  // The configured component styles (background, border, shadow, dimensions) describe the
  // thumbnail tile, so they must only be applied in thumbnail mode. In text mode the file is
  // shown as a plain filename and must not pick up the thumbnail's shadow/border/box styling.
  const isThumbnail = listType === 'thumbnail';
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

  const commonBorderStyles = css`
    border-top: ${borderTopWidth || borderWidth} ${borderTopStyle || borderStyle} ${borderTopColor || borderColor};
    border-right: ${borderRightWidth || borderWidth} ${borderRightStyle || borderStyle}
      ${borderRightColor || borderColor};
    border-left: ${borderLeftWidth || borderWidth} ${borderLeftStyle || borderStyle} ${borderLeftColor || borderColor};
    border-bottom: ${borderBottomWidth || borderWidth} ${borderBottomStyle || borderStyle}
      ${borderBottomColor || borderColor};
    box-shadow: ${boxShadow};
  `;

  const commonTextStyles = css`
    color: ${color || token.colorPrimary};
    font-family: ${fontFamily};
    font-size: ${fontSize};
    font-weight: ${fontWeight};
    text-align: ${textAlign};
  `;
  const shaStoredFilesRenderer = cx(
    'sha-stored-files-renderer',
    css`
      --thumbnail-width: ${layout ? (width ?? height ?? '54px') : '100%'};
      --thumbnail-height: ${layout ? (height ?? width ?? '54px') : '100%'};
      --ant-border-radius-xs: ${borderRadius} !important;
      --ant-border-radius-sm: ${borderRadius} !important;
      --ant-border-radius-lg: ${borderRadius} !important;
      --ant-button-content-font-size: ${fontSize} !important;
      --ant-button-font-weight: ${fontWeight} !important;
      --ant-font-family: ${fontFamily} !important;
      --thumbnail-item-height: ${hideFileName ? 'var(--thumbnail-height)' : 'calc(var(--thumbnail-height) + 32px)'};
      display: inline-block;
      vertical-align: top;
      height: ${layout ? 'var(--thumbnail-item-height)' : '100%'} !important;
      width: ${layout ? 'var(--thumbnail-width)' : '100%'} !important;
      max-height: ${layout ? (maxHeight ?? 'auto') : '100%'} !important;
      min-height: ${layout ? (minHeight ?? 'auto') : '100%'} !important;
      max-width: ${layout ? (maxWidth ?? 'auto') : '100%'} !important;
      min-width: ${layout ? (minWidth ?? 'auto') : '100%'} !important;
      ${isThumbnail ? `
      .ant-upload-list-picture-card {
        min-height: 0 !important;
      }

      .ant-upload-list-item-container {
        width: var(--thumbnail-width) !important;
        height: var(--thumbnail-item-height) !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        display: inline-block !important;
      }

      .ant-upload-list-item-container > div {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* The empty upload tile (no file yet) must match the thumbnail size and carry the configured
         border/background/radius so it looks identical to the file tiles. The designer stub renders
         .thumbnail-stub, but the live uploader renders .ant-upload-select, which otherwise keeps
         antd's default (mismatched size, dashed default border) in the dynamic/end-user view. */
      .${prefixCls}-upload-select,
      .${prefixCls}-upload.${prefixCls}-upload-select {
        width: var(--thumbnail-width) !important;
        height: var(--thumbnail-height) !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        background: ${backgroundImage ?? backgroundColor ?? background};
        ${commonBorderStyles}
        ${borderRadiusCss}
        ${extraStyles}
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
          color: ${color || token.colorPrimary} !important;
        }
      }

      .ant-upload-list-item {
        --ant-line-width: 0px !important;
        --ant-padding-xs: 0px !important;
        --font-size: ${fontSize} !important;
        --ant-font-size: ${fontSize} !important;
        display: flex;
        ${isThumbnail ? `
        ${borderRadiusCss}
        border: ${borderWidth} ${borderStyle} ${borderColor} !important;

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
        ${borderRadiusCss}
        box-sizing: border-box !important;
        padding: 0 !important;
        ${commonBorderStyles}
      }

      .thumbnail-item-name {
        ${commonTextStyles}
        ${isThumbnail ? (hideFileName ? 'display: none !important;' : `
        display: block;
        width: 100%;
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

      .thumbnail-stub {
        ${extraStyles}
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        ${borderRadiusCss}
        ${commonBorderStyles}
        ${commonTextStyles}
        box-sizing: border-box !important;
      }

      .ant-upload-list-text {
        ${commonTextStyles}
      }

      .ant-upload-drag:hover:not(.ant-upload-disabled) {
        border-color: ${token.colorPrimary} !important;
      }

      .${prefixCls}-upload {
        ${isDragger ? `min-height: ${minHeight ?? '120px'} !important;` : ''}
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
        color: ${color || token.colorPrimary} !important;
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
      ${borderRadiusCss}
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
      ${borderRadiusCss}
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
      ${commonBorderStyles}
      ${commonTextStyles}
      ${borderRadiusCss}
      padding: 0 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      background: ${backgroundImage ?? backgroundColor ?? background};
      width: var(--thumbnail-width, ${width || '54px'}) !important;
      height: var(--thumbnail-height, ${height || '54px'}) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;

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
