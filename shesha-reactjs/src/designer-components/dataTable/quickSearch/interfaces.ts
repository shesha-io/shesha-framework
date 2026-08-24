import { IConfigurableFormComponent } from '@/providers/form/models';
import { ComponentDefinition } from '@/interfaces';

export type IQuickSearchComponentProps = IConfigurableFormComponent;

export type QuickSearchComponentDefinition = ComponentDefinition<"datatable.quickSearch", IConfigurableFormComponent>;
