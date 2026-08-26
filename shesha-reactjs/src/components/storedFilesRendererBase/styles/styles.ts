import { ListType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { createStyles } from '@/styles';
import { CSSProperties } from 'react';
import { IStyleValue } from '@/providers';
import { backgroundStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '@/designer-components/_common/styles/utils';
interface IModelInterface extends IStyleValue {
  /** The nested style set for one file box (the thumbnail tile). */
  thumbnail?: IStyleValue | undefined;
  /**
   * The nested `thumbnail.style` script already evaluated to CSS. The framework only executes the
   * root `style` into `styleCss`, so a nested Custom style has to be evaluated by the caller and
   * handed in — otherwise it is saved but never rendered.
   */
  thumbnailStyleCss?: CSSProperties | undefined;
  gap?: string;
  layout?: boolean;
  hideFileName?: boolean;
  isDragger?: boolean;
  isStub?: boolean;
  downloadZip?: boolean;
  listType?: ListType;
  fontStyles?: CSSProperties;
  hasFiles?: boolean;
};

export const useStyles = createStyles((
  { token, css, cx, prefixCls },
  { model, downloadedFileStyles }: { model: IModelInterface; downloadedFileStyles?: CSSProperties | undefined },
) => {
  const layout = model.layout;
  const font = model.font;
  const textAlign = font?.align;
  const isThumbnail = model.listType === "thumbnail";

  /* The root style set is the list container; the file box has its own nested `thumbnail` set.
     The container's font is the **file name's** typography — the box holds no text of its own. */
  const fontStyle = fontStyles(font, model.styleCss);

  /* The same font without its colour, for controls whose colour carries meaning of its own. */
  const fontStylesNoColor = fontStyles(
    { ...font, color: undefined },
    { ...model.styleCss, color: undefined },
  );

  /* The upload control takes **family and size only** — plus the thumbnail dimensions, so the tile
     matches the files it sits beside. Colour, weight and alignment are excluded: it is a control,
     so its colour is the theme link colour and its weight is antd's. Taking those would make it
     read as content rather than as something to click. */
  const uploadControlFont = fontStyles(
    { type: font?.type, size: font?.size },
    { fontFamily: model.styleCss?.fontFamily, fontSize: model.styleCss?.fontSize },
  );

  const containerStyles = `
  ${dimensionsStyles(model.dimensions)}
  ${paddingStyles(model.stylingBoxJson)}
  ${backgroundStyles(model.background)}
  ${borderStyles(model.border)}
  ${shadowStyles(model.shadow)}
  ${cssPropertiesToString(model.styleCss)}
`;

  /* The file box: the thumbnail tile in thumbnail mode, and the designer stub that stands in for
     one. Emitted from the nested set so it can never pick up the container's appearance. */
  const thumbnail = model.thumbnail;
  const thumbnailStyles = `
  ${borderStyles(thumbnail?.border)}
  ${backgroundStyles(thumbnail?.background)}
  ${shadowStyles(thumbnail?.shadow)}
  ${dimensionsStyles(thumbnail?.dimensions)}
  ${paddingStyles(thumbnail?.stylingBoxJson)}
  ${cssPropertiesToString(model.thumbnailStyleCss)}
`;

  const thumbnailDimensions = `
    ${dimensionsStyles(thumbnail?.dimensions)}
    width: ${thumbnail?.dimensions?.width ?? 54} !important;
    height: ${thumbnail?.dimensions?.height ?? 54} !important;
  `;

  /* Downloaded files are marked by the colour of the name and the badge, not a second box. */
  const downloadedColor = downloadedFileStyles?.color ?? token.colorSuccess;

  const storedFilesRendererBtnContainer = "sha-stored-files-renderer-btn-container";
  const shaThumbnail = "sha-thumbnail";

  const shaItemFileName = cx("sha-item-file-name", css`
    display: flex;
    gap: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'} !important;
    flex: 1 !important;
    margin: 2px 0px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    max-width: 100%;
    min-width: 0;
    ${fontStyle}

    > .ant-typography {
      ${fontStyle}
    }
  `);

  /* Files the current user has already downloaded. The marker is the colour of the name and the
     badge — never a second box around the file, which would fight the thumbnail set. */
  const downloadedFile = cx("sha-downloaded-file", css`
    position: relative;

    .ant-upload-list-item-container {
      opacity: 0.8;
      position: relative;
    }

    .sha-item-file-name,
    .sha-item-file-name > .ant-typography {
      color: ${downloadedColor};
    }

    .ant-upload-list-item-action .anticon-download {
      color: ${downloadedColor};
    }

    /* Hide the download status badge on hover, so the action buttons underneath stay reachable. */
    &:hover .sha-downloaded-icon {
      display: none;
    }
  `);

  const downloadedIcon = cx("sha-downloaded-icon", css`
    position: ${layout ? 'absolute' : 'relative'};
    top: 4px;
    right: 4px;
    background: ${downloadedColor};
    color: ${token.colorWhite};
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    z-index: 1;
  `);

  const actionsPopover = cx("sha-actions-popover", css`
    .${prefixCls}-popover-container {
      padding: 4px;
    }
  `);

  const shaStoredFilesRenderer = cx("sha-stored-files-renderer", css`
      ${containerStyles}
      display: flex;
      gap: ${model.gap ?? '8px'} !important;
      flex-direction: column;
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-gutter: stable;
        &::-webkit-scrollbar {
          width: 8px;
          background-color: transparent;
        }

      .ant-upload-wrapper {
        flex: 1 !important;
        .ant-upload-list-picture-card {
         min-height: 0px !important;
        }
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
        /* With the file name hidden there is no name row, so the item must collapse to exactly the
           thumbnail height instead of reserving antd's default name-row space below it. */
        :before {
          display: none;
        }
      }

      .${shaThumbnail} {
        ${thumbnailStyles}
        box-sizing: border-box !important;
        overflow: hidden !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;

        > div, .ant-image {
         height: 100%;
         width: 100%;
         display: flex;
         justify-content: center;
         align-items: center;
        }

        img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: flex !important;
          justify-content: center !important;
        }
        .ant-image .anticon {
          display: block !important;
        }
      }

      /* antd renders its own file-name row; this component renders the name itself (so it can carry
         the actions popover and the downloaded marker), so antd's is hidden wherever ours is shown.
         In a tiled layout the name sits below the tile, and with Hide File Name set there is no
         name at all. */
      .ant-upload-list-item-name {
        ${layout === true || model.hideFileName === true
          ? 'display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important;'
          : ''}
      }

      .ant-upload-list-text {
        overflow: hidden;
        >.ant-upload-list-item-container {
          > div {
            >.file-name-wrapper {
              >.item-file-name {
                width: 100%;
                gap: 8px;
              }
            }
            > .downloaded-icon {
              position: relative;
              top: unset;
              right: unset;
            }
          }
        }
      }

      .${prefixCls}-upload-select {
        ${isThumbnail ? thumbnailDimensions : ''}
        flex: 0 0 auto;
        ${uploadControlFont}
        box-sizing: border-box;
        border: unset;
        align-items: center;

        .ant-btn,
        .ant-btn * {
          ${uploadControlFont}
        }

        .anticon {
          font-size: inherit;
        }

        .ant-upload {
          width: 100%; 
        }

        &.${prefixCls}-upload-btn {
            padding: unset;

          .${prefixCls}-upload-drag-icon {
            margin: unset !important;
          }
        }
      }

      .${prefixCls}-upload-drag {
        .${prefixCls}-upload-btn {
          padding: unset !important;
          width: 100% !important;

          .ant-upload-drag-icon {
           margin: 0 !important;
          }
        }

        .item-file-name {
          width: max-content !important;
          .ant-typography {
            width: max-content !important;
          }
        }
      }

      /* The root font applies to **all** text in the component, not just the file name. antd sets
         font and colour on each of these elements directly, so a rule on the wrapper alone is
         overridden rather than inherited and has to be restated here. */
      .sha-item-file-name,
      .sha-item-file-name > .ant-typography,
      .ant-upload-list-item-name,
      .ant-upload-text,
      .ant-upload-hint,
      .thumbnail-item-name {
        ${fontStyle}
      }

      /* Buttons take the font but keep their own colour — the delete icon stays red, and the upload
         trigger stays the theme link colour, which is what marks them as controls. */
      .ant-btn,
      .ant-btn * {
        ${fontStylesNoColor}
      }

      /* File-type icons are inline SVGs sized in em units, so they scale with the font size of the
         row they sit in rather than needing an explicit size passed when the icon is built. */
      .sha-item-file-name .anticon,
      .ant-btn .anticon {
        font-size: inherit;
      }
      .${storedFilesRendererBtnContainer} {
        display: flex;
        margin-top: 4px;
        justify-content: flex-end;
        width: 100%;
      }

      .${prefixCls}-upload-list {
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
        height: auto !important;
        width: ${isThumbnail ? thumbnail?.dimensions?.width ?? '54' : ''} !important;
      }

      .ant-upload-list-item-action {
        > .ant-btn-icon {
          > .anticon-delete {
            color: ${token.colorError} !important;
          }
        }
      }

      .thumbnail-stub {
        ${thumbnailStyles}
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: max-content;
      }

      > input[type="file"] {
        display: none;
      }

  `);

  const noItemAnimation = `
    &.ant-upload-animate-inline-appear,
    &.ant-upload-animate-inline-appear-active,
    &.ant-upload-animate-inline {
      display: none !important;
      animation: none !important;
      transition: none !important;
    }
  `;

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
      ${noItemAnimation}
    }
  `);

  const shaStoredFilesRendererVertical = cx("sha-stored-files-renderer-vertical", css`
    .${prefixCls}-upload-list {
      display: flex !important;
      flex-direction: column !important;
      flex-wrap: nowrap !important;
      padding: 2px !important;
      width: 100% !important;
    }

    .sha-stored-files-renderer-btn-container {
      justify-content: flex-start;
      .ant-btn {
        padding: 0;
      }
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      ${noItemAnimation}
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
    }

    .ant-upload-list-item-container {
      display: inline-block !important;
      ${noItemAnimation}
    }
  `);

  return {
    shaStoredFilesRenderer,
    shaStoredFilesRendererHorizontal,
    shaStoredFilesRendererVertical,
    shaStoredFilesRendererGrid,
    downloadedFile,
    downloadedIcon,
    actionsPopover,
    shaThumbnail,
    // shaStoredFilesRendererVertical,
    // shaStoredFilesRendererGrid,
    // storedFilesRendererBtnContainer,
    // storedFilesRendererNoFiles,
    // downloadedFile,
    // downloadedIcon,
    // antUploadDragIcon,
    // antUploadText,
    // antUploadHint,
    // thumbnailReadOnly,
    shaItemFileName,
  };
});
