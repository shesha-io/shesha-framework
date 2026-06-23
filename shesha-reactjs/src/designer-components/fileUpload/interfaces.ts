import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ListType } from '../attachmentsEditor/attachmentsEditor';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IFileUploadProps extends IConfigurableFormComponent {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
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
