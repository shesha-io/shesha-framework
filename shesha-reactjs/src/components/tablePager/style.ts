import { createStyles } from '@/styles';
import { ITablePagerBaseProps } from './tablePaging';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { fontStyles, marginStyles, paddingStyles } from '@/designer-components/_common/styles/utils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: Pick<ITablePagerBaseProps, 'font' | 'stylingBoxJson'>) => {
  const pagination = `${prefixCls}-pagination`;
  const select = `${prefixCls}-select`;

  const itemSizeVar = `--${prefixCls}-pagination-item-size-actual`;

  const pager = cx("sha-pager", css`
      * { 
          ${fontStyles(model.font)}
          -ms-overflow-style: none;
          scrollbar-width: none;
          .${pagination}-item-container {
              display: flex;
              align-items: center;
          }
          .${pagination}-item-ellipsis {
              width: max-content;
          }
          .${pagination}-item-link-icon {
              position: absolute;
          }
          .${pagination}-next button {
              ${isDefined(model.font?.size) ? `font-size: ${model.font.size}px;` : ''}                
          }
      }

      &&.${pagination} {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          min-width: 0;
          max-width: 100%;
          /* Doubled specificity so this wins over antd's own -small rule, which sets the same
             property - the pager renders at size="small". */
          ${isDefined(model.font?.size) ? itemSizeVar + ': ' + (model.font.size * 1.5) + 'px;' : ''}
      }

      /* Shrinks ahead of the controls, so a long total truncates instead of pushing them off. */
      .${pagination}-total-text {
          flex: 0 1 auto;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
      }

      .${pagination}-item,
      .${pagination}-prev,
      .${pagination}-next,
      .${pagination}-jump-prev,
      .${pagination}-jump-next {
          flex: 0 0 auto;
          a:not(.${pagination}-item-link) {
              display: flex;
              justify-content: center;
          }
      }

      .${pagination}-item-link {
          display: flex;
          height: 100%;
      }
  `);

  const dropdown = cx("sha-dropdown", css`
      .${select}-selection-item {
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
      .${select}-item-option-content {
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
