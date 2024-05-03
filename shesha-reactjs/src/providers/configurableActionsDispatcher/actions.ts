import { IActiveButton } from '@/interfaces/configurableAction';
import { createAction } from 'redux-actions';


export enum ConfigurableComponentActionEnums {
    registerActiveButton = 'REGISTER_ACTIVE_BUTTON',
     unRegisterActiveButton = 'UNREGISTER_ACTIVE_BUTTON'
};

export const registerActiveButtonAction = createAction<IActiveButton, IActiveButton>(
    ConfigurableComponentActionEnums.registerActiveButton,
    (p) => p
  );

  export const unRegisterActiveButtonAction = createAction<IActiveButton, IActiveButton>(
    ConfigurableComponentActionEnums.unRegisterActiveButton,
    (p) => p
  );