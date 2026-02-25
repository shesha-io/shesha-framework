import { ContainerDirection } from '@/components/formDesigner/common/interfaces';
import { AlignItems, JustifyContent, JustifyItems } from '@/designer-components/container/interfaces';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers';
import { ReactNode } from 'react';
import { IFontValue } from '../_settings/utils/font/interfaces';

export interface ILinkComponentProps extends IConfigurableFormComponent {
  href?: string;
  content?: string;
  propertyName: string;
  target?: string;
  download?: string;
  direction?: ContainerDirection;
  hasChildren?: boolean;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  justifyItems?: JustifyItems;
  className?: string;
  icon?: ReactNode;
  font?: IFontValue;
  components?: IConfigurableFormComponent[];
}

export type LinkComponentDefinition = ComponentDefinition<"link", ILinkComponentProps>;
