import { ComponentDefinition, IFormItem } from '@/interfaces';
import { IStyleType } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { listType } from '../attachmentsEditor/attachmentsEditor';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IFileUploadProps extends IConfigurableFormComponent, Omit<IFormItem, 'name'>, IStyleType {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  allowUpload?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  useSync?: boolean;
  allowedFileTypes?: string[];
  isDragger?: boolean;
  listType?: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
}

export type FileUploadComponentDefinition = ComponentDefinition<"fileUpload", IFileUploadProps>;
