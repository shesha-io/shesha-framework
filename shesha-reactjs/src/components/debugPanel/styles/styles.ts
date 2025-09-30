import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const debugPanelDrawer = cx("debugPanelDrawer", css`
        z-index: 1025;
    `);
  const debugPanelBody = cx("debugPanelBody", css`
        display: flex;
        height: 100%;
    `);
  const debugPanelContent = cx("debugPanelContent", css`
        height: 100%;
        width: 100%;
        overflow-y: scroll;
    `);

  const debugPanelBottomResizer = cx("debugPanelBottomResizer", css`
        width: 100%;
        border-top-color: gray;
        border-top-style: double;
        padding-bottom: 4px;
        cursor: ns-resize;
    `);

  const debugPanelTopResizer = cx("debugPanelTopResizer", css`
        width: 100%;
        border-bottom-color: gray;
        border-bottom-style: double;
        padding-top: 4px;
        cursor: ns-resize;
    `);

  const debugPanelLeftResizer = cx("debugPanelLeftResizer", css`
        height: 100%;
        padding-right: 4px;
        margin-left: 4px;
        border-left-color: gray;
        border-left-style: double;
        cursor: ew-resize;
    `);

  const debugPanelRightResizer = cx("debugPanelRightResizer", css`
        height: 100%;
        padding-left: 4px;
        margin-right: 4px;
        border-right-color: gray;
        border-right-style: double;
        cursor: ew-resize;    
    `);

  return {
    debugPanelDrawer,
    debugPanelBody,
    debugPanelContent,
    debugPanelBottomResizer,
    debugPanelTopResizer,
    debugPanelLeftResizer,
    debugPanelRightResizer,
  };
});
