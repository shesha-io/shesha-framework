import { IconType } from '@/components/shaIcon';
import { ComponentDefinition } from '@/interfaces';
import { FormIdentifier, IConfigurableFormComponent, IInputStyles, IStyleValue } from '@/providers/form/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export type LayoutType = 'vertical' | 'horizontal' | 'grid';
export type ListType = 'text' | 'thumbnail';

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
  listType: ListType;
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
