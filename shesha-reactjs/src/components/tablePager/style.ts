import { createStyles } from '@/styles';
import { ITablePagerBaseProps } from './tablePaging';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { fontStyles, marginStyles, paddingStyles } from '@/designer-components/_common/styles/utils';

export const useStyles = createStyles(({ css, cx }, model: Pick<ITablePagerBaseProps, 'font' | 'stylingBoxJson'>) => {
  const pager = cx("sha-pager", css`
      * { 
          ${fontStyles(model.font)}
          ${isDefined(model.font?.size)
            ? `
            --ant-pagination-item-size-sm: calc(${model.font.size} * 1.5px);
            --ant-pagination-item-size: calc(${model.font.size} * 1.5px);
            `
            : ''}
          -ms-overflow-style: none;
          scrollbar-width: none;
          .ant-pagination-item-container {
              display: flex;
              align-items: center;
          }
          .ant-pagination-item-ellipsis {
              position: relative;
          }
          .ant-pagination-item-link-icon{
          position: absolute;
          }
          .ant-pagination-next button {
              ${isDefined(model.font?.size) ? `font-size: ${model.font.size}};` : ''}                
          }
      }
  `);

  const dropdown = cx("sha-dropdown", css`
      .ant-select-selection-item {
          ${isDefined(model.font?.size) ? `height: calc(${model.font.size} * 1.5);` : ''}            
          display: flex;
          align-items: center;
      }

      * {
          ${isNullOrWhiteSpace(model.font?.color) ? '' : `--ant-color-text : ${model.font.color};`}
          ${isDefined(model.font?.size) ? `--ant-font-size : ${model.font.size};` : ''}
          ${isNullOrWhiteSpace(model.font?.type) ? '' : `--ant-font-family : ${model.font.type};`}
          ${fontStyles(model.font)}
      }
  `);

  const popup = cx("sha-popup", css`
      .ant-select-item-option-content {
          ${fontStyles(model.font)}
      }
  `);

  const pagerContainer = cx("sha-pager-container", css`
      ${marginStyles(model.stylingBoxJson)}
      ${paddingStyles(model.stylingBoxJson)}
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      justify-content: center;
      height: 100%;
      align-self: center;
  `);

  const pagerItemsNumber = cx("sha-pager-items-number", css`
      ${fontStyles(model.font)}
  `);


  return {
    pager,
    dropdown,
    popup,
    pagerContainer,
    pagerItemsNumber,
  };
});
