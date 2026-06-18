import { IFormItem, IToolboxComponent } from '@/interfaces';
import { IInputStyles, IPropertySetting, IStyleType } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { ImageSourceType } from './image';

export interface IImageStyleProps extends IInputStyles {
  objectFit?: 'fill' | 'contain' | 'cover' | 'scale-down' | 'none' | undefined;
  objectPosition?: string | undefined;
  filter?: string | undefined;
  filterIntensity?: number | undefined;
}

export interface IImageProps extends IConfigurableFormComponent, IFormItem, IImageStyleProps, IStyleType {
  url?: string | IPropertySetting<string> | undefined;
  storedFileId?: string | IPropertySetting<string> | undefined;
  base64?: string | undefined;
  dataSource?: ImageSourceType | undefined;
  ownerType?: string | IEntityTypeIdentifier | undefined;
  ownerId?: string | undefined;
  allowPreview?: boolean | undefined;
  allowedFileTypes?: string[] | undefined;
  alt?: string | undefined;
  opacity?: number | undefined;
  sepia?: number | undefined;
  grayscale?: number | undefined;
  blur?: number | undefined;
  brightness?: number | undefined;
  contrast?: number | undefined;
  saturate?: number | undefined;
  hueRotate?: number | undefined;
  invert?: number | undefined;
}

export type ImageComponentDefinition = IToolboxComponent<IImageProps>;
