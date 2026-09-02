import { IStyleValue } from "@/providers/form/models";

/**
 * Default appearance of an unconfigured Entity Reference.
 *
 * This is the render-time fallback for every slot the model leaves unset, the defaults argument of
 * the style-freeze migration, and the baseline the theme editor shows — so it covers exactly the
 * style groups the Appearance tab exposes, and no more.
 *
 * The component renders as inline link text rather than a boxed input, so there is deliberately no
 * border, background or shadow here: those panels are not on the Appearance tab and nothing in the
 * runtime renders them. What is left is the container geometry (dimensions, styling box) and the
 * text (font).
 */
export const defaultStyles = (): IStyleValue => {
  return {
    font: {
      weight: '400',
      size: 14,
      type: 'Segoe UI',
      align: 'left',
    },
    dimensions: {
      width: 'auto',
      height: 'auto',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    stylingBoxJson: {
      _type: 'styleBox',
      marginBottom: "0",
      marginLeft: "0",
      marginRight: "0",
      marginTop: "0",
      paddingBottom: "0",
      paddingLeft: "0",
      paddingRight: "0",
      paddingTop: "0",
    },
  };
};
