import { ButtonGroupItemProps, IDynamicItem } from "@/providers/buttonGroupConfigurator/models";
import { ComponentType, FC } from "react";
import { IDynamicActionsRegistration } from "./contexts";

export interface IProvidersDictionary {
  [key: string]: IDynamicActionsRegistration;
}

export interface IHasActions {
  items: ButtonGroupItemProps[]; // TODO: make a generic interface with minimal number of properties, ButtonGroupItemProps will implement/extend this interface
}

export type DynamicRenderingHoc = <T>(WrappedComponent: ComponentType<T & IHasActions>) => FC<T>;

export interface DynamicItemsEvaluationHookArgs<TSettings = unknown> {
  item: IDynamicItem;
  settings: TSettings | undefined;
}
export type DynamicItemsEvaluationHook<TSettings = unknown> = (args: DynamicItemsEvaluationHookArgs<TSettings>) => ButtonGroupItemProps[];
