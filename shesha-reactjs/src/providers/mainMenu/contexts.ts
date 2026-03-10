import { ISidebarMenuItem } from '@/interfaces/sidebar';
import { createNamedContext } from '@/utils/react';

export interface IConfigurableMainMenu {
  items: ISidebarMenuItem[];
  version?: number;
}

export interface IMainMenuStateContext {
  loadedMenu?: IConfigurableMainMenu;
  items?: ISidebarMenuItem[];
}

export interface IMainMenuActionsContext {
  changeMainMenu: (mainMenu: IConfigurableMainMenu) => void;
  saveMainMenu: (mainMenu: IConfigurableMainMenu) => Promise<void>;

  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const MAIN_MENU_CONTEXT_INITIAL_STATE: IMainMenuStateContext = {
  loadedMenu: {
    items: [],
  },
};

export const MainMenuStateContext = createNamedContext<IMainMenuStateContext>(MAIN_MENU_CONTEXT_INITIAL_STATE, "MainMenuStateContext");

export const MainMenuActionsContext = createNamedContext<IMainMenuActionsContext>(undefined, "MainMenuActionsContext");
