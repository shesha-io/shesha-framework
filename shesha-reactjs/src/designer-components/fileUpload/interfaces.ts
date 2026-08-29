import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { DisplayStyle, ListType } from '../attachmentsEditor/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IFileUploadProps extends IConfigurableFormComponent, IInputStyles {
  ownerId?: string | undefined;
  ownerType?: string | IEntityTypeIdentifier | undefined;
  allowUpload?: boolean | undefined;
  allowReplace?: boolean | undefined;
  allowDelete?: boolean | undefined;
  useSync?: boolean | undefined;
  allowedFileTypes?: string[] | undefined;
  isDragger?: boolean | undefined;
  /** Derived from Display Style — see the note on the file list's own `listType`. */
  listType?: ListType | undefined;
  /** The Display Style setting; `listType` and the tile size are both derived from it. */
  displayStyle?: DisplayStyle | undefined;
  thumbnailWidth?: string | undefined;
  thumbnailHeight?: string | undefined;
  borderRadius?: number | undefined;
  hideFileName?: boolean | undefined;
}

export type FileUploadComponentDefinition = ComponentDefinition<"fileUpload", IFileUploadProps>;
