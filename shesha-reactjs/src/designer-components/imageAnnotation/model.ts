import { IConfigurableFormComponent } from '@/providers';
import { IFormItem } from '@/interfaces';

export interface IAnnotation {
  id: string; // required,
  comment: string; // not required
  mark: {
    type: "RECT"; // now only support rect

    // The number of pixels in the upper left corner of the image
    x: number;
    y: number;

    // The size of tag
    width: number;
    height: number;
  };
}
export interface IAlertMessage {
  maxPoints?: number;
  data: IAnnotation[];
}
export interface IAnnotationNumbers extends IAnnotation {
  postion?: number;
}
export interface ICustomInputProps {
  value?: string;
  defaultNumber?: number;
  onChange: (value: string) => void;
  onDelete?: () => void;
}
export interface IDataAnnotationListProps {
  data: IAnnotation[];
}
export interface IImageAnnotationData {
  viewData: IAnnotation[];
  actualData: IAnnotation[];
}
export interface IImageProps extends IConfigurableFormComponent, IFormItem {
  height: string;
  width: string;
  isOnImage: boolean;
  allowAddingNotes: boolean;
  minPoints?: number;
  maxPoints?: number;
  url: string;
}
