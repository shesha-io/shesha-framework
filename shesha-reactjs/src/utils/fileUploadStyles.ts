import { CSSProperties } from 'react';
import { isDefined } from '@/utils/nullables';
import { thumbnailDefaultStyles } from '@/designer-components/attachmentsEditor/utils';

/** The thumbnail box appearance, already resolved to CSS by `useFormComponentStyles`. */
export interface IThumbnailBoxStyles {
  dimensionsStyles?: CSSProperties | undefined;
  borderStyles?: CSSProperties | undefined;
  backgroundStyles?: CSSProperties | undefined;
  shadowStyles?: CSSProperties | undefined;
}

export interface IFileUploadStyleOptions {
  enableStyleOnReadonly?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  listType?: 'text' | 'thumbnail' | undefined;
  /** Resolved styles for the Thumbnail set — the file box appearance. */
  thumbnail?: IThumbnailBoxStyles | undefined;
}

/**
 * Final CSS for the file box (the thumbnail tile, or the row in text mode).
 *
 * Shared between the FileUpload designer component and StoredFilesRendererBase. It works from the
 * Thumbnail style set rather than the legacy `allStyles`, which refactored components no longer
 * produce — reading `allStyles` here left the box unstyled for every refactored caller.
 */
export const calculateFileUploadStyles = (options: IFileUploadStyleOptions): CSSProperties => {
  const {
    enableStyleOnReadonly = true,
    isReadOnly = false,
    listType = 'text',
    thumbnail,
  } = options;

  const dimensions = thumbnail?.dimensionsStyles ?? {};
  const box: CSSProperties = {
    ...dimensions,
    ...(thumbnail?.borderStyles ?? {}),
    ...(thumbnail?.backgroundStyles ?? {}),
    ...(thumbnail?.shadowStyles ?? {}),
  };

  // In thumbnail mode the configured box appearance must render identically in read-only and edit
  // mode — only the interactive upload controls are hidden — so it survives this branch too.
  if (!enableStyleOnReadonly && isReadOnly && listType !== 'thumbnail') {
    // Text mode falls back to the plain default border. This is the *thumbnail* default: the root
    // style set describes the scrolling container, whose default border is deliberately none.
    const defaultBorder = thumbnailDefaultStyles().border?.border?.all;
    /* Every part of the shorthand is optional, and a missing one would produce the literal
       "undefined undefined undefined" rather than a border. Emit it only when all three are set,
       and otherwise leave the border alone. */
    const hasAllParts = isDefined(defaultBorder) &&
      isDefined(defaultBorder.width) &&
      isDefined(defaultBorder.style) &&
      isDefined(defaultBorder.color);
    return hasAllParts
      ? { ...dimensions, border: `${defaultBorder.width} ${defaultBorder.style} ${defaultBorder.color}` }
      : { ...dimensions };
  }

  return box;
};
