import { ListItemRenderingArgs } from "@/components/listEditor";
import { FormMarkup, IStyleValue } from "@/providers";

export type ItemSettingsMarkupFactory<TItem = unknown> = (item: TItem) => FormMarkup;

export interface DefaultItemRenderingProps extends IStyleValue {
  label: string;
  description?: string;
  icon?: string;
  stylingBox?: string;
}

export const isDefaultItemRenderingProps = (renderer: unknown): renderer is DefaultItemRenderingProps => {
  return typeof (renderer) === 'object' && 'label' in renderer;
};

export type DefaultItemRenderer<TItem = unknown> = (args: ListItemRenderingArgs<TItem>) => DefaultItemRenderingProps;
