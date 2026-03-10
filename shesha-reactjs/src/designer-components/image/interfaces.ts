import { IFormItem, IToolboxComponent } from '@/interfaces';
import { IStyleType } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { ImageSourceType } from './image';

export interface IImageStyleProps {
  height?: number | string;
  width?: number | string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'scale-down' | 'none';
  objectPosition?: string;
  filter?: string;
  filterIntensity?: number;
  borderSize?: number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  stylingBox?: string;
  opacity?: number;
  style?: string;
}

export interface IImageProps extends IConfigurableFormComponent, IFormItem, IImageStyleProps, IStyleType {
  url?: string;
  storedFileId?: string;
  base64?: string;
  dataSource?: ImageSourceType;
  ownerType?: string | IEntityTypeIdentifier;
  ownerId?: string;
  fileCategory?: string;
  allowPreview?: boolean;
  allowedFileTypes?: string[];
  alt?: string;
  opacity?: number;
  sepia?: number;
  grayscale?: number;
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  hueRotate?: number;
  invert?: number;
}

export type ImageComponentDefinition = IToolboxComponent<IImageProps>;
