import { createStyles } from '@/styles';
import { IEntityReferenceControlProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx }, model: IEntityReferenceControlProps) => {
  /* The configured box appearance, kept in one place so it can be re-asserted in the states where
     antd repaints the control (see below) without the two copies drifting apart. */
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  const entityReference = cx('sha-entity-reference', css`
    ${configuredAppearance}
    ${paddingStyles(model.stylingBoxJson)}
    ${dimensionsStyles(model.dimensions)}
    ${fontStyles(model.font, model.styleCss)}

    display: inline-flex;
    align-items: center;
    box-sizing: border-box;

    /* antd repaints a link Button in several states: its own hover/focus colours, and the
       background shorthand on the error/warning statuses (which also wipes a configured image or
       gradient). Re-assert the configured appearance at higher specificity in all of them, so the
       states never undo what the user configured. */
    &&&&:hover,
    &&&&:focus,
    &&&&:focus-within,
    &&&&[class*="-status-error"],
    &&&&[class*="-status-warning"] {
      ${configuredAppearance}
    }

    /* The text lives in an inner span, and antd sets colour and font on the Button and the anchor
       themselves — an inline Custom style on the root would be overridden there rather than
       inherited. Restate the merged Font + Custom style on the elements that actually hold the
       text. */
    &&&&,
    &&&& > span,
    &&&& > a,
    &&&& .ant-btn,
    &&&& .anticon {
      ${fontStyles(model.font, model.styleCss)}
    }

    /* The trigger is rendered as a link Button or ShaLink, both of which carry antd's own
       background. Let the configured background on the root show through instead of two
       backgrounds painting over each other. */
    &&&& > .ant-btn,
    &&&& > a {
      background: transparent;
      border: none;
      box-shadow: none;
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
    }
  `);

  return {
    entityReference,
  };
});
