import { addPx } from '@/utils/style';
import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }, {height}) => {
    const chevronButton = cx(`${prefixCls}-chevron-btn`, css`
        &:hover {
            background-color: #f0f0f0;
          }
    `);

    const buttonGroup = cx(`${prefixCls}-chevron-btn-group`, css`
        display: flex;

    `);

    const activeButton = cx(`${prefixCls}-chevron-active`, css`
        background-color: blue;
        color: white;

        &::after {
            border-left-color: blue;
        }
    `);

    const pipelineContainer = cx(`${prefixCls}-pipeline-container`, css`
      position: relative;
      display: flex;
      padding: 10px 0;

      `);

    const pipelineStages = cx(`${prefixCls}-pipeline-stages`, css`
        display: flex;
        overflow-x: auto;
        scroll-behavior: smooth;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* Internet Explorer 10+ */
        padding: 0 40px;

        &::-webkit-scrollbar {
          display: none; /* WebKit */
        }
    `);

    const pipelineStage = cx(`${prefixCls}-pipeline-stage`, css`
      flex-shrink: 0;
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      white-space: nowrap;
      margin-right: 10px;
    `);
    
    const arrowButton = cx(`${prefixCls}-arrow-button`, css`
        z-index: 10;
        background-color: #f0f0f0;
        border: none;
        width: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 20px;
        color: #666;
        border-radius: 0;
        height: ${addPx(height) || '35px'};

        &:hover {
          background-color: #e0e0e0;
        }
          
        &::before {
          width: 10px;
          height: 10px;
          border-top: 2px solid #666;
          border-right: 2px solid #666;
          display: block;
        }
      `);

    
    const leftArrow = cx(`${prefixCls}-left-arrow`, css`
      left: 5px;
      clip-path: polygon(25% 0%, 100% 1%, 100% 100%, 25% 100%, 0% 50%);

      &::before {
        transform: rotate(-135deg);
      }
    `);
    
    const rightArrow = cx(`${prefixCls}-right-arrow`, css`
      right: 5px;
      clip-path: polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%);
      
      &::before {
        transform: rotate(45deg);
      }
    `);


    return {
        chevronButton,
        buttonGroup,
        activeButton,
        pipelineContainer,
        pipelineStages,
        pipelineStage,
        leftArrow,
        rightArrow,
        arrowButton
    };
});
