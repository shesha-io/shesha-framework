import { createStyles } from '@/styles';

interface ModelProps {
  layout?: boolean | undefined;
  isDragger?: boolean | undefined;
  hideFileName?: boolean | undefined;
  listType?: 'text' | 'picture' | 'picture-card' | 'thumbnail' | undefined;
}

interface FileUploadStylesParams {
  model: ModelProps;
}

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

export const useStyles = createStyles<FileUploadStylesParams, FileUploadStylesResponse>(({ token, css, cx, prefixCls }, { model }) => {
  /* The component class (designer-components/fileUpload/styles.ts) owns the configurable
     appearance — border, background, shadow, font and dimensions all come from the Appearance
     model there. What is left here is the structural CSS that makes antd's uploader usable, plus
     the few hardcoded fallbacks below that are not configurable. */
  const BORDER_RADIUS = '8px';
  const FONT_FAMILY = 'Segoe UI';
  const FONT_SIZE = '25px';
  const DRAGGER_MIN_HEIGHT = '120px';

  const { layout: layoutProp, isDragger, hideFileName, listType } = model;
  // Normalised once so the many CSS conditionals below are strict-boolean checks rather than
  // repeating `=== true` at every interpolation.
  const layout = layoutProp === true;

  const isThumbnail = listType === 'thumbnail' && isDragger !== true;

  const antUploadDragIcon = `${prefixCls}-upload-drag-icon`;
  const antUploadText = `${prefixCls}-upload-text`;
  const antUploadHint = `${prefixCls}-upload-hint`;

  const storedFilesRendererBtnContainer = 'stored-files-renderer-btn-container';
  const storedFilesRendererNoFiles = 'stored-files-renderer-no-files';

  /* antd's own radius vars are overridden so the uploader corners match the rest of the field.
     Not configurable here: the component class applies the Appearance border radius on top. */
  const borderRadiusCss = `
    border-top-left-radius: ${BORDER_RADIUS} !important;
    border-top-right-radius: ${BORDER_RADIUS} !important;
    border-bottom-right-radius: ${BORDER_RADIUS} !important;
    border-bottom-left-radius: ${BORDER_RADIUS} !important;
  `;

  /* The empty/upload tile takes the font family only — never colour, size, weight or alignment,
     which would make it read as content, and never the box appearance. */
  const uploadTileFontCss = isThumbnail ? `font-family: ${FONT_FAMILY};` : '';

  const shaStoredFilesRenderer = cx(
    'sha-stored-files-renderer',
    css`
      /* Fallback tile size. The component class sets the configured dimensions on the tile itself;
         these vars only matter when nothing is configured. */
      --thumbnail-width: ${layout ? '54px' : '100%'};
      --thumbnail-height: ${layout ? '54px' : '100%'};
      /* Container must be a block box: it wraps block-level upload content (e.g. the Dragger),
         and as an inline <span> width/height:100% are ignored, so the content overflows and
         overlaps sibling fields. */
      display: block;
      /* The component class sizes the tile. The container wraps the tile *and* the single-line file
         name below it, so it takes the tile width (which is what the name ellipsises against) while
         its height grows to fit the extra name line. Pinning the height here instead would make the
         tile shrink when the name is shown. */
      height: auto;
      width: ${layout ? 'fit-content' : '100%'};
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
        width: 100%; height: auto;
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
        display: flex !important;
        align-items: center !important;
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
          color: ${token.colorPrimary} !important;
        }
      }

      .ant-upload-list-item {
        --ant-line-width: 0px !important;
        --ant-padding-xs: 0px !important;
        --font-size: ${FONT_SIZE} !important;
        --ant-font-size: ${FONT_SIZE} !important;
        display: flex;
      }

      .ant-upload-list-item-thumbnail {
        box-sizing: border-box !important;
        padding: 0 !important;
      }

      /* The file name is a single line under the tile, ellipsised at the tile width. It takes only
         text styling — the configured border/background/shadow/dimensions belong to the tile, not to
         the name — and it is laid out identically whether or not it is shown, so hiding it never
         changes the tile size. */
      .thumbnail-item-name {
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
          ${isThumbnail ? `
          display: inline-block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          ` : ''}
        }
        /* This took its colour from the caller-supplied style. With that path gone the declaration
           was always empty and therefore ignored by the browser, so these icons inherited their
           colour. Kept as an explicit inherit rather than pinned to a token, to preserve that. */
        .ant-space {
          .anticon {
            color: inherit;
          }
        }
      }

      .ant-upload-drag:hover:not(.ant-upload-disabled) {
        border-color: ${token.colorPrimary} !important;
      }

      .${prefixCls}-upload {
        ${isDragger === true ? `min-height: ${DRAGGER_MIN_HEIGHT} !important;` : ''}
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
        color: ${token.colorPrimary} !important;
        justify-content: ${layout ? 'center' : 'flex-start'} !important;
        align-items: center;
        padding: 0;
        * {
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
      padding: 0 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
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
