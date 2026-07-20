import { CSSProperties } from 'react';
import { IFormComponentStyles } from '@/providers';
import { defaultStyles } from '@/designer-components/attachmentsEditor/utils';

export interface IFileUploadStyleOptions {
  enableStyleOnReadonly?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  listType?: 'text' | 'thumbnail';
  allStyles?: IFormComponentStyles;
}

/**
 * Calculate the final styles for file upload components based on read-only state and list type.
 * Shared between FileUpload designer component and StoredFilesRendererBase.
 */
export const calculateFileUploadStyles = (options: IFileUploadStyleOptions): CSSProperties => {
  const {
    enableStyleOnReadonly = true,
    isReadOnly = false,
    isDisabled = false,
    listType = 'text',
    allStyles
  } = options;

  const isReadonlyOrDisabled = isReadOnly || isDisabled;
  const isReadonlyWithoutStyle = !enableStyleOnReadonly && isReadonlyOrDisabled;

  if (isReadonlyWithoutStyle) {
    const isThumbnail = listType === 'thumbnail';

    // In thumbnail mode, the configured background/border/shadow describe the thumbnail tile
    // and must render identically in read-only and edit mode, so keep the appearance styles
    // even when styling-on-readonly is disabled (only the interactive upload controls are hidden).
    if (isThumbnail) {
      return {
        ...(allStyles?.dimensionsStyles ?? {}),
        ...(allStyles?.fontStyles ?? {}),
        ...(allStyles?.borderStyles ?? {}),
        ...(allStyles?.backgroundStyles ?? {}),
        ...(allStyles?.shadowStyles ?? {}),
      };
    }

    // In text mode, fall back to the plain default border
    const defaultBorder = defaultStyles().border?.border?.all ?? {};
    return {
      ...(allStyles?.dimensionsStyles ?? {}),
      ...(allStyles?.fontStyles ?? {}),
      border: `${defaultBorder.width} ${defaultBorder.style} ${defaultBorder.color}`,
    };
  }

  // When styles are enabled on read-only, use the full style
  return allStyles?.fullStyle ?? {};
};