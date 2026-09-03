import { CSSProperties, FC, PropsWithChildren } from "react";
import { useStyles } from "../styles/styles";
import classNames from "classnames";

export interface IComponentsContainerRenderProps {
  additionalDomProperties?: Record<string, unknown> | undefined;
  noDefaultStyling?: boolean | undefined;
  style?: CSSProperties | undefined;
  direction?: 'horizontal' | 'vertical' | undefined;
  className?: string | undefined;
  wrapperStyle?: CSSProperties | undefined;
  renderedComponents: React.ReactNode | React.JSX.Element[];
}

export const ComponentsContainerRender: FC<PropsWithChildren<IComponentsContainerRenderProps>> = ({
  direction = 'vertical',
  className,
  wrapperStyle,
  children,
  additionalDomProperties,
  noDefaultStyling = false,
  style,
  renderedComponents,
}) => {
  const { styles } = useStyles();

  return noDefaultStyling ? (
    <div className={styles.shaComponentsContainerInner} style={{ ...style, textJustify: 'auto' }} {...additionalDomProperties}>{renderedComponents}{children}</div>
  ) : (
    <div className={classNames(styles.shaComponentsContainer, direction, className)} style={wrapperStyle} {...additionalDomProperties}>
      <div className={styles.shaComponentsContainerInner} style={style}>
        {renderedComponents}
      </div>
      {children}
    </div>
  );
};
