import { IConfigurableFormComponent } from 'providers';

export interface ISizableColumnProps {
  id: string;
  size: number;
  components: IConfigurableFormComponent[];
}

export interface ISizableColumnComponentProps extends IConfigurableFormComponent {
  columns: ISizableColumnProps[];
}
