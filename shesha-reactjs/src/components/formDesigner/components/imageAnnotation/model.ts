export interface IAnnotation {
    id: string,    // required,
    comment?: string,  // not required
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
export interface ICustomInputProps {
    value?: string;
    onChange: (value: string) => void;
    onDelete?: () => void;
}
export interface IDataAnnotationListProps {
    data: IAnnotation[];
}
