import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }, { fontSize, fontColor, headerBackgroundColor, height, minHeight, maxHeight }) => {
  const combinedColumnStyle = cx(
    `${prefixCls}-combined-Column-style`,
    css`
    flex: 1 0 100px;
    justify-content: space-between;
    margin: 0 10px;
    padding: 0px;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    background-color: #f5f5f5;
    width: 300px;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    height: ${height || '500px'};
    min-height: ${minHeight || '300px'};
    max-height: ${maxHeight || '500px'};
    `
  );
  const collapseColumnStyle = cx(
    `${prefixCls}-collapse-Column-style`,
    css`
    justify-content: space-between;
    margin: 0 10px;
    padding: 0px;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    height: ${height || '500px'};
    min-height: ${minHeight || '300px'};
    max-height: ${maxHeight || '500px'};
    width: 40;
    flex: '0 0 40px';
    backgroundColor: #f0f0f0;
    `
  );


  const collapsedHeaderStyle = cx(
    `${prefixCls}-collapsed-header-style`,
    css`
      color: ${fontColor || '#000000'};
      font-size: ${fontSize || '15px'};
      padding: 10px 10px;
      background-color: ${headerBackgroundColor || '#ffffff'};
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      writing-mode: vertical-rl;
      transform: rotate(180deg); 
      width: 45px;
      height: 100%;
      text-align: center; 
      white-space: nowrap; 
      overflow: hidden; 
    `
  );

  const internalHeaderStyle = cx(
    `${prefixCls}-internal-header-styles`,
    css`
      border: 1px solid #ddd;
      text-align: center;
      color: ${fontColor || '#000000'};
      font-size: ${fontSize || '15px'};
      padding: 10px 10px;
      transform: rotate(360deg);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      background-color: ${headerBackgroundColor || '#ffffff'};
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
      display: block; // Ensure it's displayed as a block element
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
    internalHeaderStyle,
    collapsedHeaderStyle,
    combinedColumnStyle,
    collapseColumnStyle
  };
});