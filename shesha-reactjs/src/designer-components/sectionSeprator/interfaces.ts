import { IConfigurableFormComponent } from '@/providers/form/models';
import { IFontValue } from '../_settings/utils/font/interfaces';
import { ComponentDefinition } from '@/interfaces';

export interface ISectionSeparatorComponentProps extends IConfigurableFormComponent {
  containerStyle?: string | undefined;
  titleStyle?: string | undefined;
  lineFont?: IFontValue | undefined;
  font?: IFontValue | undefined;
  titleStylingBox?: string | undefined;
  containerStylingBox?: string | undefined;
  dashed?: boolean | undefined;
  lineWidth?: string | undefined;
  lineHeight?: string | undefined;
}

export type SectionSeparatorComponentDefinition = ComponentDefinition<"sectionSeparator", ISectionSeparatorComponentProps>;
