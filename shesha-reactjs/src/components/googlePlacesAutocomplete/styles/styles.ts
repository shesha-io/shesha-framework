import { createStyles } from '@/styles';
import { fontStyles, paddingStyles, popupAppearanceStyles } from '@/designer-components/_common/styles/utils';
import { IStyleValue } from '@/interfaces';

/* The whole Appearance model, not a property per style: this control renders its own suggestion
   list rather than an antd popup, so there is no popup to hand a class to and the list is styled
   from these values. Taking the model as one object means a caller cannot silently omit one of
   them — see the note on `styleValue` in the component. */
export const useStyles = createStyles(({ css, cx, token }, { font, background, border, stylingBoxJson }: IStyleValue) => {
  const fontFamily = font?.type;
  const fontWeight = font?.weight;
  const textAlign = font?.align;
  const color = font?.color;
  const fontSize = font?.size;

  const dropdownContainer = "dropdown-container";
  const suggestionContainer = "suggestion-container";
  const suggestion = "suggestion";

  const highlightedSuggestion = css`
        cursor: pointer;
        background: ${token.colorPrimaryBgHover};
    `;

  const locationSearchInputWrapper = cx("location-search-input-wrapper", css`
        width: 100%;
        position: relative;

        /* The list renders in place rather than in a portal, so it is positioned against this
           wrapper and styled as its descendant. */
        .${dropdownContainer} {
            font-size: 12.5px;
            position: absolute;
            z-index: 1000;
            width: 100%;
            /* Falls back to the themed surface rather than a hardcoded white, so the list is legible
               on a dark theme even when no background is configured. Any configured appearance is
               emitted after and wins. */
            background: ${token.colorBgElevated};
            ${popupAppearanceStyles({ background, border })}
            ${paddingStyles(stylingBoxJson)}

            &.hidden {
                display: none;
            }

            .${suggestionContainer} {
                padding: 2.5px 5px;
                transition: all 0.2s ease-in;
                border-bottom: 1px solid #e8e8e8;
                ${fontStyles(font)}

                &:hover {
                    ${highlightedSuggestion}
                }

                &.highlighted {
                   ${highlightedSuggestion}
                }
            }
        }

         > .ant-input-affix-wrapper {
          .ant-input {
            --ant-color-text: ${color} !important;
            --ant-font-size: ${fontSize} !important;
            font-weight: ${fontWeight};
            font-family: ${fontFamily};
            text-align: ${textAlign};
            }
        }
`);

  return {
    highlightedSuggestion,
    dropdownContainer,
    suggestionContainer,
    locationSearchInputWrapper,
    suggestion,
  };
});
