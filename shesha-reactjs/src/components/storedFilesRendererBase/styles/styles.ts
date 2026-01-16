import { addPx } from '@/designer-components/button/util';
import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

interface ModelProps {
  gap?: string;
  layout?: boolean;
  isDragger?: boolean;
  hideFileName?: boolean;
}

export const useStyles = createStyles(({ token, css, cx, prefixCls }, { style, model, containerStyles, downloadedFileStyles }: {style: CSSProperties; model: ModelProps; containerStyles: CSSProperties; downloadedFileStyles: CSSProperties}) => {
  const { borderRadius, borderWidth, borderColor, borderStyle, color, fontSize, width, height, ...restStyles } = style;

  const { width: containerWidth, height: containerHeight, marginTop, marginLeft, marginRight, marginBottom, paddingTop,
    paddingLeft, paddingRight, paddingBottom, ...restContainerStyles } = containerStyles;

    const { color: downloadedFileColor, fontSize: downloadedFileFontSize, ...restDownloadedFileStyles} = downloadedFileStyles;
  const { gap, layout, isDragger } = model;

  const storedFilesRendererBtnContainer = "stored-files-renderer-btn-container";
  const storedFilesRendererNoFiles = "stored-files-renderer-no-files";

  const fileName = cx("item-file-name", css`
    .ant-typography {
      display: ${model.hideFileName ? 'none' : 'flex'};
      color: ${color ?? token.colorPrimary} !important;
      font-size: ${fontSize ?? '14px'} !important;
      margin: 2px 0px;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      cursor: pointer;
    }
  `);

  const fileNameWrapper = cx("file-name-wrapper", css`
    display: ${model.hideFileName ? 'none' : 'flex'};
    cursor: pointer;
  `);

  const downloadedFile = cx("downloaded-file", css`
    .ant-upload-list-item-thumbnail {
      border: 2px solid ${downloadedFileColor ?? token.colorSuccess} !important;
      box-shadow: 0 0 0 1px ${downloadedFileColor ?? token.colorSuccess}20;
      ${restDownloadedFileStyles}
    }

    .item-file-name {
      .ant-typography {
        display: ${model.hideFileName ? 'none' : 'flex'};
        color: ${downloadedFileColor ?? color} !important;
        font-size: ${addPx(downloadedFileFontSize) ?? fontSize} !important;margin: 2px 0px;
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
        color: ${downloadedFileColor ?? token.colorSuccess} !important;
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
    background: ${downloadedFileColor ?? token.colorSuccess};
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

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
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

    .ant-upload-list-item {
      display: flex;
      padding: 0 !important;
      border: none !important;

      :before {
        display: none;
      }
    }

    .ant-upload-list-item-thumbnail {
      border: ${borderWidth || '1px'} ${borderStyle || 'solid'} ${borderColor || '#d9d9d9'};
      border-radius: ${borderRadius ?? '8px'} !important;
      height: ${thumbnailHeight} !important;
      width: ${thumbnailWidth} !important;
      ${restStyles}
      position: relative !important;
      display: flex !important;
      justify-content: center;


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
      > .downloaded-icon {
      position: relative;
      top: unset;
      right: unset;
     }
    }

    .ant-upload-drag:hover:not(.ant-upload-disabled) {
      border-color: ${token.colorPrimary} !important;
    }

    .${prefixCls}-upload {

      ${(layout && !isDragger) && `width: ${thumbnailWidth} !important;`};
      ${(layout && !isDragger) && `height: ${thumbnailHeight} !important;`};

      align-items: center;

      &.${prefixCls}-upload-btn {
        .${prefixCls}-upload-drag-icon {
          margin: unset;
        }

        .${storedFilesRendererNoFiles} {
          margin-bottom: 6px;
        }

        .ant-upload-select {
          align-content: center;
          width: ${thumbnailWidth} !important;
        }
      }
    }
  
    .ant-btn {
      padding: 0;
      height: max-content !important;
      * {
        font-size: ${fontSize ?? '14px'} !important;
        color: ${color} !important;
      }
    }
    .${storedFilesRendererBtnContainer} {
      display: flex;
      margin-top: 4px;
      justify-content: flex-end;
      width: 100% !important;
      height: max-content !important;
    }
  
    .${prefixCls}-upload-list {
      ${layout ? `gap: ${marginGap}` : 'unset'};
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
      padding: 2px ${borderWidth ?? '2px'} !important;
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
    thumbnailReadOnly,
    fileName,
    fileNameWrapper,
  };
});