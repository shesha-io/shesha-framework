import { IconType } from '@/components/shaIcon';
import { ComponentDefinition } from '@/interfaces';
import { FormIdentifier, IConfigurableFormComponent, IInputStyles, IStyleValue } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { isDefined } from '@/utils/nullables';

export type LayoutType = 'vertical' | 'horizontal' | 'grid';
export type ListType = 'text' | 'thumbnail';

/**
 * How a file is presented: as its name, or as a tile at one of three preset sizes, or at a size the
 * Thumbnail dimensions decide. Shared with the File component, which presents a single file the same
 * way. `listType` stays the two-value distinction every renderer switches on — see
 * {@link displayStyleToListType} — so a preset is a choice of size, not a new kind of list.
 */
export type DisplayStyle = 'text' | 'thumbnailSmall' | 'thumbnailMedium' | 'thumbnailLarge' | 'thumbnailCustom';

/**
 * Tile edge for each preset. Medium is 54px, the size every already-saved component stores, so an
 * existing thumbnail keeps its size when migration maps it onto Medium.
 */
export const THUMBNAIL_PRESET_SIZES: Partial<Record<DisplayStyle, number>> = {
  thumbnailSmall: 32,
  thumbnailMedium: 54,
  thumbnailLarge: 104,
};

/** The preset's tile edge, or undefined for file-name and custom, which take their size elsewhere. */
export const presetThumbnailSize = (displayStyle: DisplayStyle | undefined): number | undefined =>
  displayStyle ? THUMBNAIL_PRESET_SIZES[displayStyle] : undefined;

/** Everything but file-name renders as a tile, so the renderers keep their two-value switch. */
export const displayStyleToListType = (displayStyle: DisplayStyle | undefined): ListType =>
  displayStyle === 'text' ? 'text' : 'thumbnail';

/**
 * The display style a model already saved implies: file-name stays file-name, and a thumbnail keeps
 * whatever size it stores — Medium when that is the 54px default, Custom otherwise, so no existing
 * component changes size.
 */
export const displayStyleFromListType = (
  listType: ListType | undefined,
  width: string | number | undefined,
  height: string | number | undefined,
): DisplayStyle => {
  if (listType !== 'thumbnail') return 'text';

  const medium = `${THUMBNAIL_PRESET_SIZES.thumbnailMedium}px`;
  const isMedium = (value: string | number | undefined): boolean =>
    !isDefined(value) || `${value}`.trim() === medium || `${value}`.trim() === `${THUMBNAIL_PRESET_SIZES.thumbnailMedium}`;

  return isMedium(width) && isMedium(height) ? 'thumbnailMedium' : 'thumbnailCustom';
};

/**
 * Per-device style model. The list's own layout (direction and gap) is device-scoped alongside the
 * style groups because a list that reads well in a row on desktop usually needs a column on mobile.
 *
 * The root style groups describe the **list container** — the scrolling box the files sit in — which
 * is what the Appearance tab edits by default. The individual file box has its own nested set under
 * `thumbnailStyle`. (Before v17 this was the other way round: the root held the file box and the
 * container was the nested set. Migration 17 swaps them.)
 */
export interface IAttachmentsEditorDeviceStyles extends IStyleValue {
  filesLayout?: LayoutType | undefined;
  gap?: string | number | SizeType | undefined;
  /** Style set for one file — the thumbnail box in thumbnail mode, the row in text mode. */
  thumbnailStyle?: IStyleValue | undefined;
  /** Style set applied to files the current user has already downloaded. */
  downloadedFileStyles?: IStyleValue | undefined;
  /**
   * Whether the downloaded-file styling is applied at all. Device-scoped alongside the style set it
   * gates, so a layout can highlight downloaded files on desktop but leave them plain on mobile.
   */
  styleDownloadedFiles?: boolean | undefined;
  /** Badge shown on a downloaded file. Device-scoped for the same reason as the toggle above. */
  downloadedIcon?: IconType | undefined;
  /**
   * Pre-v17 style set for the scrolling container. Retained so the migration can read it off old
   * saved models; nothing renders from it any more.
   *
   * @deprecated the container is the root style set now — use the root groups instead.
   */
  container?: IStyleValue | undefined;
}

export interface IAttachmentsEditorProps extends IConfigurableFormComponent<IAttachmentsEditorDeviceStyles>, IInputStyles {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  filesCategory?: string | undefined;
  allowedFileTypes?: string[] | undefined;
  ownerName?: string | undefined;
  allowAdd: boolean;
  allowDelete: boolean;
  allowReplace: boolean;
  allowRename: boolean;
  allowViewHistory: boolean;
  customActions?: ButtonGroupItemProps[] | undefined;
  customContent?: boolean | undefined;
  extraFormId?: FormIdentifier | undefined;
  isDynamic?: boolean | undefined;
  isDragger?: boolean | undefined;
  maxHeight?: string | undefined;
  onFileChanged?: string | undefined;
  onDownload?: string | undefined;
  downloadZip?: boolean | undefined;
  filesLayout?: LayoutType | undefined;
  gap?: string | number | SizeType | undefined;
  /**
   * What every renderer switches on, but no longer a setting of its own — derive it from Display
   * Style with {@link displayStyleToListType} rather than reading it here, which goes stale once the
   * two disagree.
   */
  listType: ListType;
  /** The Display Style setting; `listType` and the tile size are both derived from it. */
  displayStyle?: DisplayStyle | undefined;
  thumbnailWidth?: string | undefined;
  thumbnailHeight?: string | undefined;
  borderRadius?: number | undefined;
  hideFileName?: boolean | undefined;
  /** Style set for one file — see {@link IAttachmentsEditorDeviceStyles.thumbnailStyle}. */
  thumbnailStyle?: IStyleValue | undefined;
  /** @deprecated the container is the root style set now. Kept so migration 17 can read it. */
  container?: IStyleValue | undefined;
  downloadedFileStyles?: IStyleValue | undefined;
  /** @deprecated device-scoped now. Kept so migration 20 can read it off old saved models. */
  styleDownloadedFiles?: boolean | undefined;
  /** @deprecated device-scoped now. Kept so migration 20 can read it off old saved models. */
  downloadedIcon?: IconType | undefined;
}

export type AttachmentsEditorComponentDefinition = ComponentDefinition<'attachmentsEditor', IAttachmentsEditorProps>;
