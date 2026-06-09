import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ListType } from '../attachmentsEditor/attachmentsEditor';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IFileUploadProps extends IConfigurableFormComponent {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  allowUpload?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  useSync?: boolean;
  allowedFileTypes?: string[];
  isDragger?: boolean;
  listType?: ListType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
}

export type FileUploadComponentDefinition = ComponentDefinition<"fileUpload", IFileUploadProps>;
