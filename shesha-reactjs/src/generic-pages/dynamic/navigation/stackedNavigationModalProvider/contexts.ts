import { createNamedContext } from "@/utils/react";

export interface IStackedNavigationModalStateContext {
  isMaxWidth?: boolean;
  parentId?: string;
}

export const STACKED_NAVIGATION_MODAL_CONTEXT_INITIAL_STATE: IStackedNavigationModalStateContext = {};

export const StackedNavigationModalStateContext = createNamedContext<IStackedNavigationModalStateContext>(
  STACKED_NAVIGATION_MODAL_CONTEXT_INITIAL_STATE,
  "StackedNavigationModalStateContext",
);
