import { IConfigurableFormComponent } from "@/interfaces";
import { IPropertyMetadata } from "@/interfaces/metadata";
import { IModelItem } from '@/interfaces/modelConfigurator';

export interface IMetadataEditorCommonProps {
  value: IModelItem[];
  onChange: (value: IModelItem[]) => void;
  readOnly?: boolean;
}

export interface IMetadataEditorProps extends IMetadataEditorCommonProps {
  label?: string | React.ReactNode;
  baseProperties?: IPropertyMetadata[];
}

export interface IMetadataEditorComponentProps extends IConfigurableFormComponent, IMetadataEditorCommonProps {
  baseProperties?: string;
}
