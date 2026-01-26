import { listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { createStyles } from '@/styles';
import { CSSProperties } from 'react';
interface IModelInterface {
  gap?: string;
  layout?: boolean;
  hideFileName?: boolean;
  isDragger?: boolean;
  isStub?: boolean;
  downloadZip?: boolean;
  listType?: listType;
  fontStyles?: CSSProperties;
  hasFiles?: boolean;
};

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { style = {}, model = {}, containerStyles = {}, downloadedFileStyles }: { style: CSSProperties; model: IModelInterface; containerStyles: CSSProperties; downloadedFileStyles: CSSProperties }) => {
  const { background, backgroundImage, borderRadius: allRadius, width, minWidth, maxWidth,
    boxShadow, backgroundColor, backgroundPosition, backgroundRepeat, backgroundSize, color, fontFamily,
    fontSize, fontWeight, height, maxHeight, minHeight, textAlign, borderTopRightRadius, borderBottomRightRadius,
    borderBottomLeftRadius, borderTopLeftRadius,
    ...rest
  } = style;

  const { width: containerWidth, height: containerHeight,
    maxHeight: containerMaxHeight, maxWidth: containerMaxWidth, minHeight: containerMinHeight,
    minWidth: containerMinWidth, marginTop, marginLeft, marginRight, marginBottom, paddingTop,
    paddingLeft, paddingRight, paddingBottom, ...restContainerStyles } = containerStyles;

  const { gap, layout, hasFiles } = model;

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";
  const borderRadius = [
    borderTopRightRadius ?? allRadius ?? '8px',
    borderBottomRightRadius ?? allRadius ?? '8px',
    borderBottomLeftRadius ?? allRadius ?? '8px',
    borderTopLeftRadius ?? allRadius ?? '8px',
  ].join(' ');

  const colorBgTextHover = '#f0f0f0';

  const fileName = cx("item-file-name", css`
    display: flex;
    gap: 8px;
    font-size: ${fontSize ?? '14px'} !important;
    font-weight: ${fontWeight ?? '400'} !important;
    font-family: ${fontFamily ?? 'Segoe UI'} !important;
    text-align: ${textAlign ?? 'left'} !important;
    justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'} !important;
    color: ${color ?? token.colorPrimary} !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .ant-typography {
      display: ${model.hideFileName ? 'none' : 'block'};
      color: ${color ?? token.colorPrimary} !important;
      font-size: ${fontSize ?? '14px'} !important;
      font-weight: ${fontWeight ?? '400'} !important;
      font-family: ${fontFamily ?? 'Segoe UI'} !important;
      text-align: ${textAlign ?? 'left'} !important;
      justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'} !important;
      margin: 2px 0px;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      cursor: pointer;
      max-width: 100%;
      width: max-content;
    }
  `);

  const fileNameWrapper = cx("file-name-wrapper", css`
    display: ${model.hideFileName ? 'none' : 'flex'};
    gap: 8px;
    cursor: pointer;
    &:hover {
      background-color: ${colorBgTextHover} !important;
      border-radius: ${borderRadius ?? '4px'} !important;
    }
    > .item-file-name {
      &:hover {
        background-color: transparent !important;
        padding: 0;
      }
    }
  `);

  const downloadedFile = cx("downloaded-file", css`
    position: relative;

    .ant-upload-list-item-container {
      opacity: 0.8;
      position: relative;
    }

    >.ant-upload-list-item > .ant-upload-list-item-thumbnail {
      ${rest}
      opacity: 0.8;
      border: 2px solid ${downloadedFileStyles?.color ?? token.colorSuccess};
      ${{ ...downloadedFileStyles }};
    }

    .item-file-name {
      .ant-typography {
        width: ${width};
        display: ${model.hideFileName ? 'none' : 'flex'};
        color: ${downloadedFileStyles.color ?? color} !important;
        font-size: ${downloadedFileStyles?.fontSize ?? fontSize} !important;
        font-weight: ${downloadedFileStyles?.fontWeight ?? fontWeight} !important;
        font-family: ${downloadedFileStyles?.fontFamily ?? fontFamily} !important;
        text-align: ${downloadedFileStyles?.textAlign ?? textAlign} !important;
        ${downloadedFileStyles?.textAlign === 'center' ? 'justify-content: center' : downloadedFileStyles?.textAlign === 'right' ? 'justify-content: flex-end' : 'justify-content: flex-start'} !important;margin: 2px 0px;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        cursor: pointer;
      }
    }

    .ant-upload-list-item-action {
      .anticon-download {
        color: ${downloadedFileStyles?.color ?? token.colorSuccess} !important;
      }
    }

    /* Hide download status icon on hover */
    &:hover .downloaded-icon {
      display: none;
    }
  `);

  const downloadedIcon = cx("downloaded-icon", css`
    position: ${layout ? 'absolute' : 'relative'};
    top: 4px;
    right: 4px;
    background: ${downloadedFileStyles?.color ?? token.colorSuccess};
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    z-index: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  `);

  const thumbnailWidth = layout ? (width ?? '54px') : '100%';
  const thumbnailHeight = layout ? (height ?? '54px') : '100%';
  const marginGap = gap ?? '8px';

  const antUploadDragIcon = cx(`${prefixCls}-upload-drag-icon`, css`
     .${prefixCls}-upload-drag-icon {
          width: 32px;
        }
    `);
  const antUploadText = cx(`${prefixCls}-upload-text`, css`
    font-size: 16px !important;
    `);
  const antUploadHint = cx(`${prefixCls}-upload-hint`, css`

    `);


  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`
    margin-top: ${marginTop};
    margin-left: ${marginLeft};
    margin-right: ${marginRight};
    margin-bottom: ${marginBottom};
    padding-top: ${paddingTop ?? '2px'};
    padding-left: ${paddingLeft ?? '2px'};
    padding-right: ${paddingRight ?? '2px'};
    padding-bottom: ${paddingBottom ?? '2px'};
    height: ${containerHeight ?? 'auto'} !important;
    width: ${containerWidth ?? '100%'} !important;
    max-height: ${containerMaxHeight ?? 'auto'} !important;
    max-width: ${containerMaxWidth ?? '100%'} !important;
    min-height: ${containerMinHeight ?? 'auto'} !important;
    min-width: ${containerMinWidth ?? '100%'} !important;
    display: flex;
    flex-direction: column;
    ${restContainerStyles}
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-gutter: stable;
      &::-webkit-scrollbar {
        width: 8px;
        background-color: transparent;
      }

    .ant-upload-wrapper {
      flex: 1 !important;
    }

    .ant-upload:not(.ant-upload-disabled) {
      .icon {
        color: ${token.colorPrimary} !important;
      };
    }
  
    .ant-upload-list-item {
      display: flex;
      padding: 0 !important;
      border: unset !important; 
      width: 100%;
      :before {
        ${rest}
        display: none;
      }
    }

    .ant-upload-list-item-thumbnail {
      ${rest}
      background: ${background ?? backgroundImage ?? (backgroundColor ?? 'transparent')} !important;
      background-size: ${backgroundSize ?? 'cover'} !important;
      background-position: ${backgroundPosition ?? 'center'} !important;
      background-repeat: ${backgroundRepeat ?? 'no-repeat'} !important;
      box-shadow: ${boxShadow};
      border-radius: ${borderRadius ?? '8px'} !important;
      height: ${thumbnailHeight} !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;

      > div {
       height: 100%;
       width: 100%;
       display: flex;
       justify-content: center;
       align-items: center;
      }
      
      img {
        width: ${thumbnailWidth} !important;
        height: ${thumbnailHeight} !important;
        border-radius: ${borderRadius ?? '8px'} !important;
        object-fit: cover !important;
        display: flex !important;
        justify-content: center !important;
      }
      .ant-image .anticon {
        border-radius: ${borderRadius ?? '8px'} !important;
        display: block !important;
      }
    }

    .ant-upload-list-item-name {
      ${layout ? 'display: none !important' : ''};
    }

    .ant-upload-list-text {
      overflow: hidden;
      ${!hasFiles && 'display: none;'}
      >.ant-upload-list-item-container {
        > div {
          display: flex;
         justify-content: ${textAlign === 'right' ? 'flex-end' : textAlign === 'center' ? 'center' : 'flex-start'} !important;
          >.file-name-wrapper {
            >.item-file-name {
              width: 100%;
              gap: 8px;
            }
          }
        }
      }
    }
      > .downloaded-icon {
      position: relative;
      top: unset;
      right: unset;
     }
    }

    .${prefixCls}-upload-select {
      ${rest}
      border: unset;
      ${`width: ${layout ? thumbnailWidth : '100%'} !important;`};
      ${`height: ${layout ? thumbnailHeight : '100%'} !important;`};
      align-items: center;

      &.${prefixCls}-upload-btn {
          padding: unset;

        .${prefixCls}-upload-drag-icon {
          margin: unset !important;
        }

        .${storedFilesRendererNoFiles} {
          margin-bottom: 6px;
        }

        .ant-upload-select {
          align-content: center;
        }
      }
    }

    .${prefixCls}-upload-drag {
      ${hasFiles && 'border: unset !important;'}
      .${prefixCls}-upload-btn {
        padding: unset !important;
        width: 100% !important;

        .ant-upload-drag-icon {
         margin: 0 !important;
        }
      }
    }
  
    .ant-btn {
      * {
        font-size: ${fontSize ?? '14px'} !important;
        font-weight: ${fontWeight ?? '400'} !important;
        font-family: ${fontFamily ?? 'Segoe UI'} !important;
      }
    }
    .${storedFilesRendererBtnContainer} {
      display: flex;
      margin-top: 4px;
      justify-content: flex-end;
      width: ${containerWidth};
      max-width: ${containerMaxWidth};
      min-width: ${containerMinWidth};
    }
  
    .${prefixCls}-upload-list {
      ${layout ? `gap: ${marginGap} !important` : 'unset'};
      padding: 2px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      scrollbar-width: thin;
      &::-webkit-scrollbar {
        width: 8px;
        background-color: transparent;
      }
    }
      
    .ant-upload-list-item-uploading {
      display: none;
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
      width: ${layout ? (width ?? '54px') + ' !important' : ''};
      height: auto !important;
    }

    .ant-upload-list-item-action {
      > .ant-btn-icon {
        > .anticon-delete {
          color: ${token.colorError} !important;
        }
      }
    }

    .thumbnail-stub {
      ${rest}
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: max-content;
    }

`);

  const shaStoredFilesRendererHorizontal = cx("sha-stored-files-renderer-horizontal", css`
      height: max-content;
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-wrap: nowrap !important;
      flex-direction: row !important;
      flex-shrink: 0 !important;
      overflow-x: auto;
      overflow-y: clip !important;
      align-items: stretch !important;
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      border-radius: ${borderRadius ?? '8px'} !important;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
    }
`);

  const shaStoredFilesRendererVertical = cx("sha-stored-files-renderer-vertical", css`
    max-width: max-content !important;
    width: max-content !important;
    min-width: max-content !important;
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: column !important;
      flex-wrap: nowrap !important;
      padding: 2px !important;
      width: 100% !important;
    }

    .stored-files-renderer-btn-container {
      justify-content: flex-start;
      .ant-btn {
        padding: 0;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      border-radius: ${borderRadius ?? '8px'} !important;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
    }
`);

  const shaStoredFilesRendererGrid = cx("sha-stored-files-renderer-grid", css`
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: wrap !important;
      align-items: stretch !important;
      align-content: flex-start !important;
      padding: 2px;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      .${prefixCls}-upload-list-item {
        width: 100% !important;
        height: 100% !important;
        border-radius: ${borderRadius ?? '8px'} !important;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      border-radius: ${borderRadius ?? '8px'} !important;
      &.ant-upload-animate-inline-appear,
      &.ant-upload-animate-inline-appear-active,
      &.ant-upload-animate-inline {
        display: none !important;
        animation: none !important;
        transition: none !important;
      }
    }
`);

  const thumbnailReadOnly = cx("ant-upload-list-item thumbnail-readonly", css`
      text-align: center;
      align-items: center;
      justify-content: center;
      background-color: #00000005 !important;
      border: 1px dashed #d9d9d9 !important;
      border-radius: 8px !important;
  `);

  const hiddenElement = cx("hidden-element", css`
    display: none !important;
  `);

  const actionsPopover = cx("actions-popover", css`
    .ant-popover-inner {
      padding: 4px;
    }
  `);

  const uploadButton = cx("upload-button", css`
    width: 100%;
    justify-content: ${textAlign === 'center' || model.listType === 'thumbnail' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'};
  `);

  return {
    shaStoredFilesRenderer,
    shaStoredFilesRendererHorizontal,
    shaStoredFilesRendererVertical,
    shaStoredFilesRendererGrid,
    storedFilesRendererBtnContainer,
    storedFilesRendererNoFiles,
    downloadedFile,
    downloadedIcon,
    antUploadDragIcon,
    antUploadText,
    antUploadHint,
    thumbnailReadOnly,
    fileName,
    fileNameWrapper,
    hiddenElement,
    actionsPopover,
    uploadButton,
  };
});
