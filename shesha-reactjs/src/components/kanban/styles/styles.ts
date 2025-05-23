import { addPx } from '@/utils/style';
import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }, { isCollapsed, dimensionsStyles, fontStyles }) => {
  const combinedColumnStyle = cx(
    `${prefixCls}-combined-Column-style`,
    css`
      justify-content: space-between;
      margin: 0 10px;
      padding: 0px;
      display: flex;
      flex-direction: column;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      height: ${addPx(dimensionsStyles?.height) || '500px'};
      min-height: ${addPx(dimensionsStyles?.minHeight) || '300px'};
      max-height: ${addPx(dimensionsStyles?.maxHeight) || '500px'};

      min-width: ${isCollapsed ? '45px' : addPx(dimensionsStyles?.minWidth) || '300px'};
      width: ${isCollapsed ? '45px' : addPx(dimensionsStyles?.width) || '300px'};
      max-width: ${isCollapsed ? '45px' : addPx(dimensionsStyles?.maxWidth) || '500px'};
     ${isCollapsed
        &&`
        border: none !important;
        `}
    `
  );

  const combinedHeaderStyle = cx(
    `${prefixCls}-header-style`,
    css`
      color: ${fontStyles?.color || '#000000'};
      font-size: ${fontStyles?.fontSize || '15px'};
      font-weight: ${fontStyles?.fontWeight || '400'};
      font-family: ${fontStyles?.fontFamily || 'Arial'};
      padding: 15px 15px;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: center;

      ${isCollapsed
        ? `
               writing-mode: vertical-rl;
               transform: rotate(180deg); 
               width: 45px;
               height: 100%;
               text-align: center; 
               white-space: nowrap; 
               overflow: hidden;
               padding: 10px 0;
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
});
