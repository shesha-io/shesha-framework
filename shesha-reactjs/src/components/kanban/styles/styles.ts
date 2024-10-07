import { addPx } from '@/designer-components/button/util';
import { createStyles } from '@/styles';

export const useStyles = createStyles(
  (
    { css, cx, prefixCls },
    { columnBackgroundColor, fontSize, fontColor, headerBackgroundColor, height, minHeight, maxHeight, isCollapsed }
  ) => {
    const combinedColumnStyle = cx(
      `${prefixCls}-combined-Column-style`,
      css`
        justify-content: space-between;
        margin: 0 10px;
        padding: 0px;
        border: 1px solid #ddd;
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        height: ${addPx(height) || '500px'};
        min-height: ${addPx(minHeight) || '300px'};
        max-height: ${addPx(maxHeight) || '500px'};

        /* Conditional styles based on isCollapsed */
        min-width: ${isCollapsed ? '40px' : '300px'};
        width: ${isCollapsed ? '40px' : '300px'};
        max-width: ${isCollapsed ? '40px' : '300px'};
      `
    );

    const combinedHeaderStyle = cx(
      `${prefixCls}-header-style`,
      css`
        color: ${fontColor || '#000000'};
        font-size: ${addPx(fontSize) || '15px'};
        padding: 10px 10px;
        background-color: ${headerBackgroundColor || '#ffffff'};
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid #ddd;
        text-align: center;

        /* Dynamic styles based on isCollapsed */
        ${isCollapsed
          ? `
                writing-mode: vertical-rl;
                transform: rotate(180deg); 
                width: 45px;
                height: 100%;
                text-align: center; 
                white-space: nowrap; 
                overflow: hidden;
            `
          : `
                transform: rotate(360deg);
            `}
      `
    );

    const taskContainer = cx(
      `${prefixCls}-task-container`,
      css`
        overflow-y: hidden;
        position: relative;
        &:hover .three-dots {
          opacity: 1;
        }
      `
    );

    const noTask = cx(
      `${prefixCls}-no-task`,
      css`
        text-align: center;
        color: #999;
        padding: 20px;
        margin: 10px; // Add margin for better spacing
        border: 1px dashed #d9d9d9;
        border-radius: 5px;
        display: block;
      `
    );

    const container = cx(
      `${prefixCls}-container`,
      css`
        background-color: ${columnBackgroundColor || '#ffffff'};
        overflow-y: hidden;
        /* Hide scrollbar for Chrome, Safari and Opera */
        &::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      `
    );

    const threeDots = cx(
      `${prefixCls}-three-dots`,
      css`
        position: absolute;
        top: 0;
        right: 0;
        margin: 5px;
        z-index: 10;
        opacity: 0;
        transition: opacity 0.3s ease;
      `
    );

    return {
      noTask,
      container,
      threeDots,
      taskContainer,
      combinedHeaderStyle,
      combinedColumnStyle,
    };
  }
);
