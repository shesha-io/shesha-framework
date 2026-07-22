import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

type StylesArgs = {
  style: CSSProperties | undefined;
};
type StylesResponse = {
  pager: string;
  dropdown: string;
  popup: string;
  pagerContainer: string;
};

export const useStyles = createStyles<StylesArgs, StylesResponse>(({ css, cx }, { style = {} }) => {
  const pager = cx("sha-pager", css`
        * { 
            ${style.fontSize
              ? `--ant-pagination-item-size-sm: calc(${style.fontSize} * 1.5px) !important;
            --ant-pagination-item-size: calc(${style.fontSize} * 1.5px) !important;
            font-size: ${style.fontSize} !important;`
              : ''}
            ${style.color ? `color: ${style.color} !important;` : ''}            
            ${style.fontWeight ? `font-weight: ${style.fontWeight} !important;` : ''}            
            -ms-overflow-style: none;
            scrollbar-width: none;
            font-family: ${style.fontFamily} !important;
            .ant-pagination-item-container {
                display: flex !important;
                align-items: center !important;
            }
            .ant-pagination-item-ellipsis {
                position: relative !important;
            }
            .ant-pagination-item-link-icon{
            position: absolute !important;
            }
            .ant-pagination-next button {
                ${style.fontSize ? `font-size: ${style.fontSize} !important;` : ''}                
            }
        }
    `);

  const dropdown = cx("sha-dropdown", css`
        .ant-select-selection-item {
            ${style.fontSize ? `height: calc(${style.fontSize} * 1.5);` : ''}            
            display: flex;
            align-items: center;
        }

        * {
            ${style.color ? `--ant-color-text : ${style.color} !important;` : ''}
            ${style.fontSize ? `--ant-font-size : ${style.fontSize} !important;` : ''}
            ${style.fontFamily ? `--ant-font-family : ${style.fontFamily} !important;` : ''}
            ${style.fontFamily ? `font-family: ${style.fontFamily} !important;` : ''}
            ${style.fontWeight ? `font-weight: ${style.fontWeight} !important;            ` : ''}
        }
    `);

  const popup = cx("sha-popup", css`
        .ant-select-item-option-content {
            ${style.fontSize ? `font-size: ${style.fontSize} !important;` : ''}
            ${style.fontFamily ? `font-family: ${style.fontFamily} !important;` : ''}
            ${style.color ? `color: ${style.color} !important;` : ''}
            ${style.fontWeight ? `font-weight: ${style.fontWeight} !important;` : ''}
        }
    `);

  const pagerContainer = cx("sha-pager-container", css`
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        justify-content: center;
        height: 100%;
        align-self: center;
    `);

  return {
    pager,
    dropdown,
    popup,
    pagerContainer,
  };
});
