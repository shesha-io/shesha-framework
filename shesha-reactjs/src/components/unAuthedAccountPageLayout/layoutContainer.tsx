import { FC, PropsWithChildren } from "react";
import { useStyles } from "./styles";
import React from "react";
import classNames from "classnames";

export type UnAuthedLayoutContainerProps = {
  className?: string | undefined;
};

export const UnAuthedLayoutContainer: FC<PropsWithChildren<UnAuthedLayoutContainerProps>> = ({ children, className }) => {
  const { styles } = useStyles();
  return (
    <div className={classNames(styles.container, className)}>
      {children}
    </div>
  );
};
