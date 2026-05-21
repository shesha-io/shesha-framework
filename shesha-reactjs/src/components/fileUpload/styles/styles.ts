import { createStyles } from '@/styles';
import { CSSObject } from '@emotion/serialize';
import { addPx } from '@/utils/style';

interface StyleProps extends CSSObject {
  jsStyle?: CSSObject;
}

interface ModelProps {
  layout?: boolean;
  isDragger?: boolean;
  hideFileName?: boolean;
  listType?: 'text' | 'picture' | 'picture-card' | 'thumbnail';
}

interface UseStylesParams {
  style?: StyleProps;
  model: ModelProps;
}

type TextAlignType = 'left' | 'right' | 'center' | 'justify';

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { style, model }: UseStylesParams) => {
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
    borderTop,
    boxShadow,
    borderBottom,
    borderBottomColor,
    borderBottomStyle,
    borderRight,
    borderRightWidth,
    backgroundColor,
    backgroundPosition,
    backgroundRepeat,
    backgroundSize,
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
    border: ${borderWidth} ${borderStyle} ${borderColor};
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
      height: ${layout ? (height ?? '54px') : '100%'} !important;
      width: ${layout ? (width ?? '54px') : '100%'} !important;
      max-height: ${layout ? (maxHeight ?? 'auto') : '100%'} !important;
      min-height: ${layout ? (minHeight) : '100%'} !important;
      max-width: ${layout ? (maxWidth) : '100%'} !important;
      min-width: ${layout ? (minWidth) : '100%'} !important;
      display: inline-block;
      background: ${backgroundImage ?? backgroundColor ?? background};
      ${backgroundPosition ? `background-position: ${backgroundPosition};` : ''}
      ${backgroundRepeat ? `background-repeat: ${backgroundRepeat};` : ''}
      ${backgroundSize ? `background-size: ${backgroundSize};` : ''}

      .ant-upload-select-picture-card,
      .ant-upload-list-picture-card .ant-upload-select,
      .ant-upload-list-picture-card .ant-upload.ant-upload-select {
        width: var(--thumbnail-width) !important;
        height: var(--thumbnail-height) !important;
        background-position: ${backgroundPosition} !important;
        background-repeat: ${backgroundRepeat} !important;
        background-size: ${backgroundSize} !important;
        ${borderRadiusCss}
        border: ${borderWidth} ${borderStyle} ${borderColor} !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .ant-upload-list-item {
        width: var(--thumbnail-width) !important;
        height: calc(var(--thumbnail-height) + 32px) !important;
        border-top: ${borderTop} !important;
        border-bottom: ${borderBottom} !important;
        border-right: ${borderRight} !important;
      }

      .ant-upload-list-picture-card {
        height: ${hideFileName
          ? 'var(--thumbnail-height)'
          : `calc(var(--thumbnail-height) + ${fontSize} * 2 + 32px)`} !important;
        min-height: ${hideFileName
          ? 'var(--thumbnail-height)'
          : `calc(var(--thumbnail-height) + ${fontSize} * 2 + 32px)`} !important;
        padding-bottom: 1rem;
      }

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
        ${borderRadiusCss}
        border: ${borderWidth} ${borderStyle} ${borderColor} !important;
        display: flex;

        :before {
          top: 0;
          width: 100% !important;
          ${borderRadiusCss}
          border: ${borderWidth} ${borderStyle} ${borderColor} !important;
          height: 100% !important;
        }
      }

      .ant-upload-list-item-thumbnail {
        ${borderRadiusCss}
        padding: 0 !important;
        ${commonBorderStyles}
        ${style}
      }

      .thumbnail-item-name {
        ${commonTextStyles}
        a {
          ${commonTextStyles}
        }
        .ant-space {
          .anticon {
            color: ${color} !important;
          }
        }
        ${style?.jsStyle}
      }

      .thumbnail-stub {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        ${borderRadiusCss}
        border: ${borderWidth} ${borderStyle} ${borderColor} !important;
        ${style}
      }

      .ant-upload-list-text {
        ${commonTextStyles}
        max-height: calc(var(--container-max-height) - calc(${fontSize} * 4)) !important;
        min-height: calc(var(--container-min-height) - 32px) !important;
        width: calc(var(--container-width) - 32px) !important;
        max-width: calc(var(--container-max-width) - 32px) !important;
        min-width: calc(var(--container-min-width) - 32px) !important;
      }

      .ant-upload-drag:hover:not(.ant-upload-disabled) {
        border-color: ${token.colorPrimary} !important;
      }

      .${prefixCls}-upload {

        width: ${layout && !isDragger ? 'var(--thumbnail-width)' : isDragger ? (width ?? height ?? '120px') : 'auto'} !important;
        height: ${layout && !isDragger ? 'var(--thumbnail-height)' : isDragger ? (height ?? width ?? '120px') : (height ?? width ?? '54px')} !important;
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
        ${style}
        width: 100% !important;
        height: 100% !important;
        border: none !important;
        background: transparent !important;
      }

      .ant-upload-list-item-container {
        background: ${backgroundImage ?? backgroundColor} !important;
        width: var(--thumbnail-width) !important;
        height: var(--thumbnail-height) !important;
        ${borderRadiusCss}
        border: ${borderWidth} ${borderStyle} transparent !important;
        &.ant-upload-animate-inline-appear,
        &.ant-upload-animate-inline-appear-active,
        &.ant-upload-animate-inline {
          display: none !important;
          animation: none !important;
          transition: none !important;
        }
        ${style}
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
      width: var(--thumbnail-width, 54px) !important;
      height: var(--thumbnail-height, 54px) !important;
      ${borderRadiusCss}
      object-fit: cover !important;
      display: flex !important;
      justify-content: center !important;
    `,
  );

  const overlayThumbnailControls = cx(
    'overlay-thumbnail-controls',
    css`
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.6);
      height: ${height ?? '54px'} !important;
      width: ${width ?? '54px'} !important;
      opacity: 0;
      border-radius: 8px;
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
      background: ${background ?? backgroundImage ?? backgroundColor} !important;
      width: ${width || '54px'} !important;
      height: ${height || '54px'} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;

      .anticon {
        img {
          object-fit: cover !important;
        }
      }
      ${style}
    `,
  );

  const thumbnailReadOnly = cx("ant-upload-list-item thumbnail-readonly", css`
      text-align: center;
      align-items: center;
      justify-content: center;
      background-color: #00000005 !important;
      border: 1px dashed #d9d9d9 !important;
      border-radius: 8px !important;
  `);

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
    thumbnailReadOnly,
  };
});
