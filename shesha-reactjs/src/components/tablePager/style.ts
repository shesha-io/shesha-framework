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
            --ant-pagination-item-size-sm: calc(${model.font.size}px * 1.5px);
            --ant-pagination-item-size: calc(${model.font.size}px * 1.5px);
            `
            : ''}
          -ms-overflow-style: none;
          scrollbar-width: none;
          .ant-pagination-item-container {
              display: flex;
              align-items: center;
          }
          .ant-pagination-item-ellipsis {
              width: max-content;
          }
          .ant-pagination-item-link-icon{
            position: absolute;
          }
          .ant-pagination-next button {
              ${isDefined(model.font?.size) ? `font-size: ${model.font.size}px;` : ''}                
          }
      }

      &.ant-pagination {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          min-width: 0;
          max-width: 100%;
      }

      .ant-pagination-total-text {
          flex: 0 1 auto;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
      }

      .ant-pagination-item,
      .ant-pagination-prev,
      .ant-pagination-next,
      .ant-pagination-jump-prev,
      .ant-pagination-jump-next {
          flex: 0 0 auto;
      }

      .ant-pagination-item-link {
          display: flex;
          height: 100%;
      }
  `);

  const dropdown = cx("sha-dropdown", css`
      .ant-select-selection-item {
          ${isDefined(model.font?.size) ? `height: calc(${model.font.size}px * 1.5px);` : ''}            
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
      flex-wrap: wrap;
      height: 100%;
      align-self: center;
      min-width: 0;
      overflow: hidden;
  `);

  const pagerItemsNumber = cx("sha-pager-items-number", css`
      ${fontStyles(model.font)}
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
  `);


  return {
    pager,
    dropdown,
    popup,
    pagerContainer,
    pagerItemsNumber,
  };
});
