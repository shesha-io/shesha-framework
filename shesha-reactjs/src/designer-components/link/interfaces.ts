import { ContainerDirection } from '@/components/formDesigner/common/interfaces';
import { AlignItems, JustifyContent, JustifyItems } from '@/designer-components/container/interfaces';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers';
import { ReactNode } from 'react';
import { IFontValue } from '../_settings/utils/font/interfaces';

export interface ILinkComponentProps extends IConfigurableFormComponent {
  href?: string | undefined;
  content?: string | undefined;
  propertyName: string;
  target?: string | undefined;
  download?: string | undefined;
  direction?: ContainerDirection | undefined;
  hasChildren?: boolean | undefined;
  justifyContent?: JustifyContent | undefined;
  alignItems?: AlignItems | undefined;
  justifyItems?: JustifyItems | undefined;
  className?: string | undefined;
  icon?: ReactNode | undefined;
  font?: IFontValue | undefined;
  components?: IConfigurableFormComponent[] | undefined;
}

export type LinkCalculatedModel = {
  href: string | undefined;
  isDesignerMode: boolean | undefined;
};

export type LinkComponentDefinition = ComponentDefinition<"link", ILinkComponentProps, LinkCalculatedModel>;
