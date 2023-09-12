import { ComponentType } from '../../components/formComponentSelector';
import { IConfigurableFormComponent } from '../../providers/form/models';

export interface IComponentSelectorComponentProps extends IConfigurableFormComponent {
  componentType: ComponentType;
  noSelectionItemText?: string;
  noSelectionItemValue?: string;
}
