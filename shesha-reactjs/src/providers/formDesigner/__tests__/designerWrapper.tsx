import { FC, PropsWithChildren } from 'react';
import { FormDesignerContext } from '../contexts';
import { FormDesignerInstance } from '../instance';

/** Wraps test renders in the given designer */
export const designerWrapper = (designer: FormDesignerInstance): FC<PropsWithChildren> => {
  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <FormDesignerContext.Provider value={designer}>{children}</FormDesignerContext.Provider>
  );
  return Wrapper;
};
