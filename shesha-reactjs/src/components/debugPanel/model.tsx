import { IModelMetadata, IPropertyMetadata } from "@/interfaces/metadata";

export interface IDebugDataTreeProps {
    name: string;
    data: any;
    metadata?: IModelMetadata;
    lastUpdated?: number;
    editAll?: boolean;
    onChange: (propName: string, val: any) => void;
    onFunctionExecute?: (path: string) => void;
}

export interface IDebugDataTreeItemProps {
    name: string;
    value: any;
    metadata?: IPropertyMetadata;
    readonly?: boolean;
    onChange?: (val: any) => void;
    onClick?: () => void;
}