import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { ListType } from '../attachmentsEditor/attachmentsEditor';
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
  listType?: ListType | undefined;
  thumbnailWidth?: string | undefined;
  thumbnailHeight?: string | undefined;
  borderRadius?: number | undefined;
  hideFileName?: boolean | undefined;
}

export type FileUploadComponentDefinition = ComponentDefinition<"fileUpload", IFileUploadProps>;
