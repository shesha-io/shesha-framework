import { ListItemRenderingArgs } from "@/components/listEditor";
import { FormMarkup, IStyleType } from "@/providers";
import { isDefined } from "@/utils/nullables";

export type ItemSettingsMarkupFactory<TItem = unknown> = (item: TItem) => FormMarkup;

export interface DefaultItemRenderingProps extends IStyleType {
  label: string;
  description?: string | undefined;
  icon?: string | undefined;
  stylingBox?: string | undefined;
}

export const isDefaultItemRenderingProps = (renderer: unknown): renderer is DefaultItemRenderingProps => {
  return isDefined(renderer) && typeof (renderer) === 'object' && 'label' in renderer;
};

export type DefaultItemRenderer<TItem = unknown> = (args: ListItemRenderingArgs<TItem>) => DefaultItemRenderingProps;
