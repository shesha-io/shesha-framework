import { ListItemRenderingArgs } from "@/components/listEditor";
import { FormMarkup } from "@/providers";

export type ItemSettingsMarkupFactory<TItem = any> = (item: TItem) => FormMarkup;

export interface DefaultItemRenderingProps {
    label: string;
    description?: string;
    icon?: string;
}

export const isDefaultItemRenderingProps = (renderer: any): renderer is DefaultItemRenderingProps => {
    return typeof (renderer) === 'object' && 'label' in renderer;
};

export type DefaultItemRenderer<TItem = any> = (args: ListItemRenderingArgs<TItem>) => DefaultItemRenderingProps;