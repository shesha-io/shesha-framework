import { IConfigurableFormComponent } from "../../../../providers";
import { ITableViewProps } from "../../../../providers/tableViewSelectorConfigurator/models";

export interface IDataSourceComponentProps extends IConfigurableFormComponent {
    sourceType?: 'Form' | 'Entity' |'Url';
    entityType?: string;
    endpoint?: string;

    filters?: ITableViewProps [];
    //persistSelectedFilters?: boolean;
    //componentRef?: MutableRefObject<any>;

    maxResultCount?: number;
}

export interface IDataSourceSettingsProps {
    readOnly: boolean;
    model: IDataSourceComponentProps;
    onSave: (model: IDataSourceComponentProps) => void;
    onCancel: () => void;
    onValuesChange?: (changedValues: any, values: IDataSourceComponentProps) => void;
  }
  