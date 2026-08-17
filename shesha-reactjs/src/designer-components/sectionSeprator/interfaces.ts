import { IConfigurableFormComponent, StyleBoxValue } from '@/providers/form/models';
import { IFontValue } from '../_settings/utils/font/interfaces';
import { ComponentDefinition } from '@/interfaces';

export interface ISectionSeparatorComponentPropsV0 extends IConfigurableFormComponent {
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

export interface ISectionSeparatorComponentProps extends IConfigurableFormComponent {
  lineFont?: IFontValue | undefined;
  font?: IFontValue | undefined;
  titleStylingBoxJson?: StyleBoxValue | undefined;
  containerStylingBoxJson?: StyleBoxValue | undefined;
  dashed?: boolean | undefined;
  lineWidth?: string | undefined;
  lineHeight?: string | undefined;
  lineType?: string | undefined;
  titleMargin?: number | undefined;
}

export type SectionSeparatorComponentDefinition = ComponentDefinition<"sectionSeparator", ISectionSeparatorComponentProps>;
