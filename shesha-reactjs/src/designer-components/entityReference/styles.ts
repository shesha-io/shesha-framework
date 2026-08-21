import { createStyles } from '@/styles';
import { IEntityReferenceControlProps } from './interfaces';
import { backgroundStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, paddingStyles, popupAppearanceStyles, shadowStyles, splitTextProperties } from '../_common/styles/utils';

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

  /* The Custom style describes both the box and the text, and the two halves land on different
     elements of a popup. `fontStyles` takes the whole Custom style and reads only the text half
     itself, so only the box half needs splitting out here. Width is dropped first: the popover is
     sized by the Quickview Width setting, and the trigger width would fight it. */
  const { width: _width, height: _height, ...customStyle } = model.styleCss ?? {};
  const { box: customBoxStyle } = splitTextProperties(customStyle);

  /* Popover and modal are both portalled to the body, so no descendant selector from the root class
     can reach them — each needs its own class passed through the relevant prop.

     `popupAppearanceStyles` emits background and border only, deliberately not the shadow: on the
     trigger a shadow is decorative, but on a panel overlaying the page it is structural, and a
     configured offset would throw a band of colour across whatever the panel covers. Elevation is
     the part users expect to look native, so it stays with the theme. */
  const popupAppearance = `
    ${popupAppearanceStyles(model)}
    ${cssPropertiesToString(customBoxStyle)}
  `;

  /* antd 6 renders the popover as root > `-container` (the painted panel: background, radius,
     shadow, padding) wrapping `-title` and `-content`. The v5 `-inner` / `-inner-content` elements
     no longer exist, so the appearance goes on `-container`. */
  const entityReferencePopup = cx('sha-entity-reference-popup', css`
    &&& .ant-popover-container {
      ${popupAppearance}
      /* Padding goes on the panel, insetting the form inside it — that is what "padding" means for
         a popup. Applied per row it would multiply down the form instead. */
      ${paddingStyles(model.stylingBoxJson)}
    }

    /* antd sets colour and font on these elements themselves, so a rule on the panel is overridden
       rather than inherited. Restate the merged Font + Custom style where the text actually is. */
    &&& .ant-popover-title,
    &&& .ant-popover-content,
    &&& .ant-form-item-label > label,
    &&& .read-only-display-form-item {
      ${fontStyles(model.font, model.styleCss)}
    }
  `);

  /* The modal has the same shape in antd 6: `-container` is the painted panel, with `-header`,
     `-title` and `-body` inside it. The class lands on the modal wrapper (`wrapClassName`), so
     every rule is scoped from there. */
  const entityReferenceModal = cx('sha-entity-reference-modal', css`
    &&& .ant-modal-container {
      ${popupAppearance}
      ${paddingStyles(model.stylingBoxJson)}
    }

    /* The header paints its own background over the configured one. */
    &&& .ant-modal-header,
    &&& .ant-modal-body {
      background: transparent;
    }

    &&& .ant-modal-title,
    &&& .ant-modal-body,
    &&& .ant-form-item-label > label,
    &&& .read-only-display-form-item {
      ${fontStyles(model.font, model.styleCss)}
    }
  `);

  return {
    entityReference,
    entityReferencePopup,
    entityReferenceModal,
  };
});
