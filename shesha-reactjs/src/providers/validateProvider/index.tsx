import React, { useContext, FC, PropsWithChildren, useMemo, useId, useRef, useEffect } from "react";
import { createNamedContext } from "@/utils/react";

export interface IValidator {
  id: string;
  validate: () => Promise<void>;
}

export interface IValidateProviderStateContext {
  id: string;
  registerChild: (input: IValidateProviderStateContext) => void;
  unRegisterChild: (input: IValidateProviderStateContext) => void;
  registerValidator: (input: IValidator) => void;
  validate: () => Promise<void>;
}

export interface IValidateProviderProps {
}

export const ValidateProviderStateContext = createNamedContext<IValidateProviderStateContext>(
  {
    id: '',
    registerChild: () => undefined,
    unRegisterChild: () => undefined,
    registerValidator: () => undefined,
    validate: (): Promise<void> => undefined,
  },
  "ValidateProviderStateContext");

export function useValidator(require: boolean = true) {
  const stateContext = useContext(ValidateProviderStateContext);

  if (stateContext === undefined && require) {
    throw new Error('useValidator must be used within a ValidateProvider');
  }
  return stateContext;
}

const ValidateProvider: FC<PropsWithChildren<IValidateProviderProps>> = ({ children }) => {
  const parent = useValidator(false);
  const id = useId();

  const childValidateProvider = useRef<IValidateProviderStateContext[]>([]);
  const validators = useRef<IValidator[]>([]);

  const registerChild = (input: IValidateProviderStateContext) => {
    const exists = childValidateProvider.current.find((item) => item.id === input.id);
    if (!exists)
      childValidateProvider.current = [...childValidateProvider.current, input];
    else
      childValidateProvider.current = childValidateProvider.current.map((item) => {
        return item.id === input.id ? input : item;
      });
  };

  const unRegisterChild = (input: IValidateProviderStateContext) => {
    const existsPos = childValidateProvider.current.findIndex((item) => item.id === input.id);
    if (existsPos > -1)
      childValidateProvider.current.splice(existsPos, 1);
  };

  const registerValidator = (input: IValidator) => {
    const exists = validators.current.find((item) => item.id === input.id);
    if (!exists)
      validators.current = [...validators.current, input];
    else
      validators.current = validators.current.map((item) => {
        return item.id === input.id ? input : item;
      });
  };

  const validate = () => {
    const promises = validators.current.map((validator) => {
      return validator.validate();
    });
    childValidateProvider.current.forEach((child) => {
      promises.push(child.validate());
    });
    return Promise.all(promises).then((_x) => null);
  };

  const value = useMemo((): IValidateProviderStateContext => {
    return {
      id,
      registerChild,
      unRegisterChild,
      registerValidator,
      validate,
    };
  }, [childValidateProvider.current, validators.current]);

  useEffect(() => {
    if (parent) {
      parent.registerChild(value);
    }
    return () => {
      if (parent)
        parent.unRegisterChild(value);
    };
  }, [value]);

  return (
    <ValidateProviderStateContext.Provider value={value}>
      {children}
    </ValidateProviderStateContext.Provider>
  );
};

export default ValidateProvider;
