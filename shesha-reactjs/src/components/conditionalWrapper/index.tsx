import React, { FC, PropsWithChildren, ReactNode } from "react";

export interface IConditionalWrapProps {
  condition: boolean;
  wrap: (children: ReactNode) => ReactNode;
}

export const ConditionalWrap: FC<PropsWithChildren<IConditionalWrapProps>> = ({ condition, wrap, children }) => {
  return <>{condition ? wrap(children) : children}</>;
};

export const withWrapper = <WrapperProps extends object = object>(
  content: ReactNode,
  Wrapper: FC<PropsWithChildren<WrapperProps>>,
  wrapperProps?: WrapperProps,
): ReactNode => {
  return (
    <Wrapper {...wrapperProps}>
      {content}
    </Wrapper>
  );
};

export default ConditionalWrap;
