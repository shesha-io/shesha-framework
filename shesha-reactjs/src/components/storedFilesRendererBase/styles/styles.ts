import { ListType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { createStyles } from '@/styles';
import { CSSProperties } from 'react';
import { addPx } from '@/utils/style';
import { IStyleValue } from '@/providers';
import { backgroundStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles, splitTextProperties } from '@/designer-components/_common/styles/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
interface IModelInterface extends IStyleValue {
  thumbnailStyle?: IStyleValue | undefined;
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

  /* Flex equivalent of a configured text alignment. Several parts of the component are flex
     containers rather than blocks of text, and `text-align` does nothing on those — their content
     is placed by `justify-content`, so the alignment has to be translated to reach them. */
  const toJustifyContent = (align: CSSProperties['textAlign']): string => align === 'center'
    ? 'center'
    : align === 'right'
      ? 'flex-end'
      : 'flex-start';

  const justifyContent = toJustifyContent(textAlign);

  const isThumbnail = model.listType === "thumbnail" && model.isDragger !== true;

  /* The root style set is the list container; the file box has its own nested `thumbnailStyle` set.
     The container's font is the **file name's** typography — the box holds no text of its own. */
  const fontStyle = fontStyles(font, model.styleCss);

  /* The same font without its colour, for controls whose colour carries meaning of its own. */
  const fontStylesNoColor = fontStyles(
    { ...font, color: undefined },
    { ...model.styleCss, color: undefined },
  );

  /* The same font without its alignment, for the dragger stub. The stub is a centred block — an icon
     above two lines of prompt text, all sitting in the middle of the drop area — so its text is
     centred by construction rather than by the configured Align. Letting the alignment through would
     shunt the prompt to one edge while the icon above it stayed put. */
  const fontStylesNoAlign = fontStyles(
    { ...font, align: undefined },
    { ...model.styleCss, textAlign: undefined },
  );

  const uploadControlFont = fontStyles(
    { type: font?.type, size: font?.size },
    { fontFamily: model.styleCss?.fontFamily, fontSize: model.styleCss?.fontSize },
  );

  /* The prompt takes the configured Font colour, as the dragger's prompt and the File component's
     trigger do. Custom style wins; the link colour is the fallback when none is set. */
  const uploadControlColor = !isNullOrWhiteSpace(model.styleCss?.color)
    ? model.styleCss.color
    : !isNullOrWhiteSpace(font?.color)
      ? font.color
      : token.colorLink;

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
  const thumbnail = model.thumbnailStyle;
  const thumbnailStyles = `
  ${borderStyles(thumbnail?.border)}
  ${backgroundStyles(thumbnail?.background)}
  ${shadowStyles(thumbnail?.shadow)}
  ${dimensionsStyles(thumbnail?.dimensions)}
  ${paddingStyles(thumbnail?.stylingBoxJson)}
  ${cssPropertiesToString(model.thumbnailStyleCss)}
`;

  /* A bare number is not valid CSS for a non-zero length, so configured values go through `addPx`
     and the fallback carries its own unit. */
  const thumbnailDimensions = `
    ${dimensionsStyles(thumbnail?.dimensions)}
    width: ${addPx(thumbnail?.dimensions?.width) ?? '54px'} !important;
    height: ${addPx(thumbnail?.dimensions?.height) ?? '54px'} !important;
  `;

  /* Downloaded files are marked by the colour of the name and the badge, not a second box. The
     colour is read out on its own because the badge is painted with it; the rest of the set styles
     the file itself. */
  const downloadedColor = downloadedFileStyles?.color ?? token.colorSuccess;

  /* Split the way every other set here is: text properties reach the name, which antd styles
     directly and which therefore inherits nothing, and the rest reach the row around it. */
  const { text: downloadedText, box: downloadedBox } = splitTextProperties(downloadedFileStyles);

  /* Its Align needs the same translation as the root's, and for the same reason: the name sits in a
     flex container, so the `text-align` in `downloadedText` reaches it but places nothing. Emitted
     only when the set actually carries an alignment — an unset one has to leave the root's in place
     rather than resetting downloaded files to the left. */
  const downloadedJustifyContent = isDefined(downloadedText.textAlign)
    ? toJustifyContent(downloadedText.textAlign)
    : undefined;

  const storedFilesRendererBtnContainer = "sha-stored-files-renderer-btn-container";
  const shaThumbnail = "sha-thumbnail";

  const shaItemFileName = cx("sha-item-file-name", css`
    display: flex;
    gap: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: ${justifyContent} !important;
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

    > .${prefixCls}-typography {
      ${fontStyle}
    }
  `);

  /* Stands in for the list, so it takes the file name's typography — which is what the root Font
     panel describes — rather than whatever the page happens to set. */
  const shaEmptyText = cx("sha-empty-text", css`
    ${fontStyle}
    justify-content: ${justifyContent};
  `);

  /* itemRender replaces antd's list item, and its hover background goes with it, so the row
     highlight is restored here on the wrapper that stands in for it. */
  const shaFileNameWrapper = cx("sha-file-name-wrapper", css`
    display: flex;
    gap: 8px;
    cursor: pointer;

    &:hover {
      background-color: ${token.controlItemBgHover};
      border-radius: ${token.borderRadiusSM}px;
    }
  `);

  /* Files the current user has already downloaded. The marker is the colour of the name and the
     badge — never a second box around the file, which would fight the thumbnail set. */
  const downloadedFile = cx("sha-downloaded-file", css`
    position: relative;
    display: flex;
    ${cssPropertiesToString(downloadedBox)}

    .${prefixCls}-upload-list-item-container {
      opacity: 0.8;
      position: relative;
    }

    /* Colour first so the configured set can override it, and so an unconfigured colour still
       falls back to the theme's success green.

       The class is doubled to raise specificity. The root Font is restated on these very selectors
       further down — it has to be, since antd styles the name directly — at the same specificity and
       later in the stylesheet, so on a tie it won every property it declares. That is why this set
       looked colour-only: the root Font declares size, weight, family and align and overrode all
       four, and only colour got through, because the root Font carries none by default. Ordering the
       two rules would fix it just as well and break as soon as either moves. */
    && .sha-item-file-name,
    && .sha-item-file-name > .${prefixCls}-typography {
      color: ${downloadedColor};
      ${cssPropertiesToString(downloadedText)}
    }

    /* The root Font's alignment sits on this very element as an important justify-content, so the
       doubled class alone is not enough to displace it — the override has to be important too and
       win on specificity. Kept off the selector above: the name itself is not a flex container, and
       the property would do nothing there. */
    ${isDefined(downloadedJustifyContent)
      ? `&& .sha-item-file-name { justify-content: ${downloadedJustifyContent} !important; }`
      : ''}

    .${prefixCls}-upload-list-item-action .anticon-download {
      color: ${downloadedColor};
    }

    /* Hide the download status badge on hover, so the action buttons underneath stay reachable. */
    &:hover .sha-downloaded-icon {
      display: none;
    }
  `);

  /* The downloaded set applied to the file name directly: in thumbnail mode the name is a sibling
     under the tile, so no descendant selector from `downloadedFile` can reach it. Tripled to clear
     the root Font's three-class restatement in the container set below, which is emitted later. */
  const downloadedFileName = cx("sha-downloaded-file-name", css`
    &&& {
      color: ${downloadedColor};
      ${cssPropertiesToString(downloadedText)}
      ${isDefined(downloadedJustifyContent) ? `justify-content: ${downloadedJustifyContent} !important;` : ''}
    }

    &&& > .${prefixCls}-typography {
      color: ${downloadedColor};
      ${cssPropertiesToString(downloadedText)}
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

      .${prefixCls}-upload-wrapper {
        flex: 1 !important;
        .${prefixCls}-upload-list-picture-card {
         min-height: 0px !important;
        }
      }

      .${prefixCls}-upload:not(.${prefixCls}-upload-disabled) {
        .icon {
          color: ${token.colorPrimary} !important;
        };
      }

      .${prefixCls}-upload-list-item {
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

        > .${prefixCls}-upload-list-item , .${prefixCls}-image, .anticon {
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

        .${prefixCls}-image {
          display: block !important;
        }
      }

      .${prefixCls}-upload-list-item-name {
        ${layout === true || model.hideFileName === true
          ? 'display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important;'
          : ''}
      }

      .${prefixCls}-upload-select {
        width: 100%;
        ${isThumbnail ? thumbnailDimensions : ''}
        flex: 0 0 auto;
        ${uploadControlFont}
        box-sizing: border-box;
        border: unset;
        align-items: center;

        .${prefixCls}-btn,
        .${prefixCls}-btn * {
          ${uploadControlFont}
        }

        .anticon {
          font-size: inherit;
        }

        .${prefixCls}-upload {
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
          border: ${model.hasFiles ? 'none' : ''};

        /* The trigger fills the drop area's width, but its content stays centred with the icon and
           prompt beneath it — a dragger is a centred block, so the configured Align deliberately
           does not reach it. */
        .${prefixCls}-btn {
          width: 100% !important;
          justify-content: ${model.hasFiles ? justifyContent : ''}
        }

        .${prefixCls}-upload-btn {
          padding: unset !important;
          width: 100% !important;

          .${prefixCls}-upload-drag-icon {
           margin: 0 !important;
          }
        }

        .item-file-name {
          width: max-content !important;
          .${prefixCls}-typography {
            width: max-content !important;
          }
        }
      }

      /* The root font applies to **all** text in the component, not just the file name. antd sets
         font and colour on each of these elements directly, so a rule on the wrapper alone is
         overridden rather than inherited and has to be restated here. */
      .sha-item-file-name,
      .sha-item-file-name > .${prefixCls}-typography,
      .${prefixCls}-upload-list-item-name,
      .thumbnail-item-name {
        ${fontStyle}
      }

      /* The dragger stub's prompt lines: the configured font, but always centred — see
         fontStylesNoAlign. */
      .${prefixCls}-upload-text,
      .${prefixCls}-upload-hint {
        ${fontStylesNoAlign}
        text-align: center;
      }

      /* Buttons take the font but keep their own colour — the delete icon stays red, and the upload
         trigger stays the theme link colour, which is what marks them as controls. */
      .${prefixCls}-btn * {
        ${fontStylesNoColor}
      }

      .${prefixCls}-btn {
        justify-content: ${isThumbnail ? '' : justifyContent};
      }

      ${isThumbnail ? '' : `
      .${prefixCls}-upload-select .${prefixCls}-btn {
        justify-content: ${justifyContent};
        width: 100%;
      }

      /* antd's 15px of button padding steps the prompt in from the container's edge. Only the
         inline half goes — the block half is what gives the trigger an input's height. */
      > .${prefixCls}-btn,
      .${prefixCls}-upload-select .${prefixCls}-btn {
        padding-inline: 0;
      }

      /* Text and icon; !important because antd colours the link button from its own class. Neither
         selector reaches the per-file action icons, so the delete stays red. */
      > .${prefixCls}-btn,
      > .${prefixCls}-btn *,
      .${prefixCls}-upload-select .${prefixCls}-btn,
      .${prefixCls}-upload-select .${prefixCls}-btn * {
        color: ${uploadControlColor} !important;
      }
      `}

      /* File-type icons are inline SVGs sized in em units, so they scale with the font size of the
         row they sit in rather than needing an explicit size passed when the icon is built. */
      .sha-item-file-name .anticon,
      .${prefixCls}-btn .anticon {
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

      /* Rows share the trigger's edge; the block half stays for hover and focus rings. Must follow
         the shorthand it narrows — same specificity, so source order decides. */
      ${isThumbnail ? '' : `
      .${prefixCls}-upload-list {
        padding-inline: 0;
      }
      `}

      .${prefixCls}-upload-list-item-uploading {
        display: none;
      }

      .${prefixCls}-upload-list-item-container {
        display: inline-block !important;
        &.${prefixCls}-upload-animate-inline-appear,
        &.${prefixCls}-upload-animate-inline-appear-active,
        &.${prefixCls}-upload-animate-inline {
          display: none !important;
          animation: none !important;
          transition: none !important;
        }
        height: auto !important;
        /* The thumbnail set's Margin lands here rather than on the box itself: this is the element
           the list lays out, and the box is pinned to its width, so a margin there would overflow. */
        ${isThumbnail ? `width: ${addPx(thumbnail?.dimensions?.width) ?? '54px'} !important; ${marginStyles(thumbnail?.stylingBoxJson)}` : ''}
      }

      .${prefixCls}-upload-list-item-action {
        > .${prefixCls}-btn-icon {
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

  /* Tiles are laid out by the upload list, so that is where the configured Gap belongs — the
     container's own gap only ever separated the trigger from the Download Zip row. */
  const tileSpacing = `
    /* !important because antd doubles the class — .ant-upload-list.ant-upload-list-picture-card —
       to set its own picture-card gap, which outranks a single-class rule. */
    .${prefixCls}-upload-list {
      gap: ${model.gap ?? '8px'} !important;
    }

    /* Cleared so Gap is the only spacing; antd's item margin would otherwise add to it on the
       vertical axis and leave a grid's rows further apart than its columns. */
    .${prefixCls}-upload-list-item {
      margin-top: 0 !important;
    }
  `;

  const noItemAnimation = `
    &.${prefixCls}-upload-animate-inline-appear,
    &.${prefixCls}-upload-animate-inline-appear-active,
    &.${prefixCls}-upload-animate-inline {
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

    .${prefixCls}-upload-list-item-container {
      display: inline-block !important;
      ${noItemAnimation}
    }

    ${tileSpacing}
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
      .${prefixCls}-btn {
        padding: 0;
      }
    }

    .${prefixCls}-upload-list-item-container {
      display: inline-block !important;
      ${noItemAnimation}
    }

    ${tileSpacing}
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

    .${prefixCls}-upload-list-item-container {
      display: inline-block !important;
      ${noItemAnimation}
    }

    ${tileSpacing}
  `);

  return {
    shaStoredFilesRenderer,
    shaStoredFilesRendererHorizontal,
    shaStoredFilesRendererVertical,
    shaStoredFilesRendererGrid,
    downloadedFile,
    downloadedFileName,
    downloadedIcon,
    actionsPopover,
    shaThumbnail,
    shaItemFileName,
    shaEmptyText,
    shaFileNameWrapper,
    storedFilesRendererBtnContainer,
  };
});
