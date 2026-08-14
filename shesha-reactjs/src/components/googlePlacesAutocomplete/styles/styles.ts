import { createStyles } from '@/styles';
import { cssPropertiesToString, fontStyles, paddingStyles, popupAppearanceStyles, splitTextProperties } from '@/designer-components/_common/styles/utils';
import { IStyleValue } from '@/interfaces';

export const useStyles = createStyles(({ css, cx, token }, { font, background, border, stylingBoxJson, styleCss }: IStyleValue) => {
  /* The Custom style, split so each half lands where it takes effect: the box half on the list, the
     text half on each row. Dimensions are dropped — the list is sized to the wrapper and grows with
     its suggestions. */
  const { width: _w, height: _h, ...popupCustomStyle } = styleCss ?? {};
  const { text: customTextStyle, box: customBoxStyle } = splitTextProperties(popupCustomStyle);


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
            ${cssPropertiesToString(customBoxStyle)}

            &.hidden {
                display: none;
            }

            .${suggestionContainer} {
                padding: 2.5px 5px;
                transition: all 0.2s ease-in;
                border-bottom: 1px solid #e8e8e8;
                /* The Custom style is merged in rather than emitted separately: the list sets its
                   own colour and font size, so a rule on the container alone does not reach the
                   text. */
                ${fontStyles(font, customTextStyle)}

                &:hover {
                    ${highlightedSuggestion}
                }

                &.highlighted {
                   ${highlightedSuggestion}
                }
            }
        }

        &&& .ant-input-affix-wrapper,
        &&& input.ant-input,
        &&& input {
            ${fontStyles(font, customTextStyle)}
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
