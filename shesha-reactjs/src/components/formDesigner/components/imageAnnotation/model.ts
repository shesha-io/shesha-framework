import { IFormItem } from "../../../..";
import { IConfigurableFormComponent } from "../../../../providers";

export interface IAnnotation {
    id: string,    // required,
    comment: string,  // not required
    mark: {
        type: "RECT",                  // now only support rect

        // The number of pixels in the upper left corner of the image
        x: number,
        y: number,

        // The size of tag
        width: number,
        height: number
    }
}
export interface IAnnotationNumbers extends IAnnotation {
    postion?: number;
}
export interface ICustomInputProps {
    value?: string;
    defaultNumber?: string;
    onChange: (value: string) => void;
    onDelete?: () => void;
}
export interface IDataAnnotationListProps {
    data: IAnnotation[];
}
export interface IImageProps extends IConfigurableFormComponent, IFormItem {
    height: string;
    width: string;
    isOnImage: boolean;
    url: string;
}
