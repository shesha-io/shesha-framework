import { ComponentDefinition } from '@/interfaces';
import { IStyleType } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { listType } from '../attachmentsEditor/attachmentsEditor';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IFileUploadProps extends IConfigurableFormComponent, IStyleType {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  allowUpload?: boolean | undefined;
  allowReplace?: boolean | undefined;
  allowDelete?: boolean | undefined;
  useSync?: boolean | undefined;
  allowedFileTypes?: string[] | undefined;
  isDragger?: boolean | undefined;
  listType?: listType | undefined;
  thumbnailWidth?: string | undefined;
  thumbnailHeight?: string | undefined;
  borderRadius?: number | undefined;
  hideFileName?: boolean | undefined;
}

export type FileUploadComponentDefinition = ComponentDefinition<"fileUpload", IFileUploadProps>;
