import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }, { fontFamily, fontWeight, textAlign, color, fontSize }) => {
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
    
        .${dropdownContainer} {
            font-size: 12.5px;
            position: absolute;
            z-index: 1000;
            width: 100%;
            background: white;
    
            &.hidden {
                display: none;
            }
    
            .${suggestionContainer} {
                padding: 2.5px 5px;
                transition: all 0.2s ease-in;
                border-bottom: 1px solid #e8e8e8;
        
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
