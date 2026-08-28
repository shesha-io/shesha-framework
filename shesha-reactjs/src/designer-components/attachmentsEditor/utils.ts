import { INestedStyleValue, IStyleValue } from "@/providers/form/models";
import { IAttachmentsEditorDeviceStyles } from "./interfaces";

/** Margin/padding slot shared by every default style set below. */
export const emptyStyleBox = (): IStyleValue['stylingBoxJson'] => ({
  _type: 'styleBox',
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
});

/**
 * Default Appearance styles: the list container's own values, plus the nested `thumbnailStyle` set
 * describing one file box. Same shape as the checkbox group's wrapper + `checkbox` pair.
 */
export const defaultStyles = (): IAttachmentsEditorDeviceStyles => {
  return {
    filesLayout: 'horizontal',
    gap: 8,
    ...containerDefaultStyles(),
    thumbnailStyle: thumbnailDefaultStyles(),
    styleDownloadedFiles: false,
    downloadedIcon: 'CheckCircleOutlined',
    downloadedFileStyles: downloadedFileDefaultStyles(),
  };
};

/**
 * The list container — the scrolling box the files sit in, and the set the standard Appearance
 * panels bind to.
 *
 * Its font is the **file name's** typography, which is why the Font panel is the one Appearance
 * panel not hidden outside thumbnail mode. Border and background are deliberately neutral: the
 * container is a scrolling box rather than a painted panel, so it draws nothing until configured.
 */
export const containerDefaultStyles = (): IStyleValue => {
  return {
    font: {
      type: 'Segoe UI',
      color: '#000',
      align: 'left',
      size: 14,
      weight: '400',
    },
    dimensions: {
      width: 'auto',
      height: 'auto',
      minHeight: '0px',
      maxHeight: '140px',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    border: {
      border: {
        all: {
          width: 1,
          style: 'none',
          color: '#d9d9d9',
        },
      },
      radius: { all: 0 },
      borderType: 'all',
      radiusType: 'all',
    },
    background: { type: 'color', color: '' },
    shadow: {
      offsetX: 0,
      offsetY: 0,
      color: '#000',
      blurRadius: 0,
      spreadRadius: 0,
    },
    stylingBoxJson: emptyStyleBox(),
  };
};

/**
 * A single file box (the thumbnail tile).
 *
 * No font — the nested Appearance panel exposes none, because the file name sits outside this box
 * and takes its typography from the container above.
 */
export const thumbnailDefaultStyles = (): IStyleValue => {
  return {
    border: {
      radiusType: 'all',
      borderType: 'all',
      border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } },
      radius: { all: 8 },
    },
    dimensions: {
      width: '54px',
      height: '54px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    background: {
      type: 'color',
      color: '',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
      url: '',
    },
    shadow: {
      spreadRadius: 0,
      blurRadius: 0,
      color: '#000',
      offsetX: 0,
      offsetY: 0,
    },
    stylingBoxJson: emptyStyleBox(),
  };
};

/** Files the current user has already downloaded — text colour only. */
export const downloadedFileDefaultStyles = (): IStyleValue => {
  return {
    font: {
      type: 'Segoe UI',
      align: 'left',
      size: 14,
      weight: '400',
      color: '#52c41a',
    },
  };
};

/** Convenience alias matching the checkbox group's `INestedStyleValue` typing. */
export type AttachmentsEditorStyles = INestedStyleValue<'thumbnail'>;
