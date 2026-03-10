import { ListItemRenderingArgs } from "@/components/listEditor";
import { FormMarkup, IStyleType } from "@/providers";

export type ItemSettingsMarkupFactory<TItem = any> = (item: TItem) => FormMarkup;

export interface DefaultItemRenderingProps extends IStyleType {
  label: string;
  description?: string;
  icon?: string;
  stylingBox?: string;
}

export const isDefaultItemRenderingProps = (renderer: unknown): renderer is DefaultItemRenderingProps => {
  return typeof (renderer) === 'object' && 'label' in renderer;
};

export type DefaultItemRenderer<TItem = any> = (args: ListItemRenderingArgs<TItem>) => DefaultItemRenderingProps;
