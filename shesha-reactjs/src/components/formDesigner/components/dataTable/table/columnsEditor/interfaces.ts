import { IConfigurableFormComponent } from '../../../../../../interfaces';
import { ColumnsItemProps } from '../../../../../../providers/datatableColumnsConfigurator/models';
import { ITableComponentBaseProps } from '../models';

export interface IColumnsEditorComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {
    items: ColumnsItemProps[];
}