import { FC, PropsWithChildren, ReactNode } from "react";

interface IConditionalWrapProps {
  condition: boolean;
  wrap: (children: ReactNode) => ReactNode;
}

const ConditionalWrap: FC<PropsWithChildren<IConditionalWrapProps>> = ({ condition, wrap, children }) => {
  return <>{condition ? wrap(children) : children}</>;
};

export default ConditionalWrap;
