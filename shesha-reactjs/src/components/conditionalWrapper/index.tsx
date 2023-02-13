import React, { FC, PropsWithChildren, ReactNode } from "react";

export interface IConditionalWrapProps {
  condition: boolean;
  wrap: (children: ReactNode) => ReactNode;
}

export const ConditionalWrap: FC<PropsWithChildren<IConditionalWrapProps>> = ({ condition, wrap, children }) => {
  return <>{condition ? wrap(children) : children}</>;
};

export default ConditionalWrap;
