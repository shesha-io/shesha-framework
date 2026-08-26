import { createStyles } from '@/styles';
import { IEntityReferenceControlProps } from './interfaces';
import { dimensionsStyles, fontStyles, marginStyles, paddingStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx }, model: IEntityReferenceControlProps) => {
  /*
   * An entity reference renders as inline link text, not as a boxed input, so it deliberately
   * exposes no border, background or shadow: a box drawn around a link reads as a different
   * control. The only container styles are the dimensions and the styling box; everything else
   * about its appearance is text, which is what Font and the Custom style describe.
   */
  const entityReference = cx('sha-entity-reference', css`
    ${dimensionsStyles(model.dimensions)}
    ${marginStyles(model.stylingBoxJson)}
    ${paddingStyles(model.stylingBoxJson)}
    ${fontStyles(model.font, model.styleCss)}

    display: inline-flex;
    align-items: center;
    box-sizing: border-box;

    /* The text lives in an inner span, and antd sets colour and font on the Button and the anchor
       themselves — an inline Custom style on the root would be overridden there rather than
       inherited. Restate the merged Font + Custom style on the elements that actually hold the
       text, including the states where antd swaps a link Button to its hover/focus colour. */
    &&&&,
    &&&& > span,
    &&&& > a,
    &&&& .ant-btn,
    &&&& .anticon,
    &&&&:hover,
    &&&&:hover > span,
    &&&&:hover > a,
    &&&&:focus,
    &&&&:focus-visible {
      ${fontStyles(model.font, model.styleCss)}
    }

    &&&& .ant-btn {
      justify-content: ${model.font?.align === 'center' ? "center" : model.font?.align === 'right' ? "flex-end" : "flex-start"}
    }

    /* The trigger is rendered as a link Button or ShaLink, both of which bring antd's own box.
       Clear it so the reference sits inline as plain link text. */
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

  /*
   * Popover and modal are portalled to the body, so no descendant selector from the root class can
   * reach them — each needs its own class passed through the relevant prop.
   *
   * They carry font only. The panel itself keeps the theme's own background, border and elevation
   * so it stays consistent with every other popup in the app; the component contributes just the
   * text styling, so the panel's content matches the link that opened it.
   */
  const popupFont = `
    ${fontStyles(model.font, model.styleCss)}
  `;

  /* antd 6 renders the popover as root > `-container` (the painted panel) wrapping `-title` and
     `-content`. antd sets colour and font on those elements themselves, so a rule on the panel is
     overridden rather than inherited — restate it where the text actually is. */
  const entityReferencePopup = cx('sha-entity-reference-popup', css`
    &&& .ant-popover-title,
    &&& .ant-popover-content,
    &&& .ant-form-item-label > label,
    &&& .read-only-display-form-item {
      ${popupFont}
    }
  `);

  /* Same shape for the modal: `-container` is the panel, with `-header`, `-title` and `-body`
     inside it. The class lands on the modal wrapper (`wrapClassName`), so rules are scoped from
     there. */
  const entityReferenceModal = cx('sha-entity-reference-modal', css`
    &&& .ant-modal-title,
    &&& .ant-modal-body,
    &&& .ant-form-item-label > label,
    &&& .read-only-display-form-item {
      ${popupFont}
    }
  `);

  return {
    entityReference,
    entityReferencePopup,
    entityReferenceModal,
  };
});
