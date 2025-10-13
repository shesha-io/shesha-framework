import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const leftSidebarWidth = "550px";
  const sidebarBtnHeight = "35px";

  const sidebarContainerHeader = "sidebar-container-header";
  const sidebarContainerBody = "sidebar-container-body";
  const sidebarContainerMainArea = "sidebar-container-main-area";
  const sidebarContainerMainAreaBody = "sidebar-container-main-area-body";
  const sidebarHeader = "sidebar-header";
  const sidebarHeaderTitle = "sidebar-header-title";
  const sidebarHeaderBtn = "sidebar-header-btn";
  const sidebarBody = "sidebar-body";
  const sidebarBodyPlaceholder = "sidebar-body-placeholder";
  const sidebarBodyContent = "sidebar-body-content";
  const sidebarContainerLeft = "sidebar-container-left";
  const sidebarContainerRight = "sidebar-container-right";
  const designerCanvas = "designer-canvas";

  const sidebarContainer = cx("sidebar-container", css`
      width: 100%;
      overflow-x: hidden;

      .${sidebarContainerMainAreaBody}{
        overflow: auto;
        height: 100%;

      }
    
      .${sidebarContainerHeader} {
        padding: ${sheshaStyles.paddingLG}px;
        background-color: white;
      }
    
      .${sidebarContainerBody} {
        height: 100%;
        display: flex;
        position: relative;
        width: 100%;
        min-height: 100%;
    
        .${sidebarContainerLeft},
        .${sidebarContainerRight} {
          &.allow-full-collapse {
            display: none;
          }
    
          &.open {
            width: ${leftSidebarWidth};
            display: block;

            .${sidebarHeader} {
              .sidebar-header-title {
                display: flex;
                width:100%;
              }
            
            }
          }
    
          background: white;

          .sidebar-subheader {
            margin-top: 8px;
            background: #282828;
            font-weight: 500;
            font-size: 16px;
            color: white;
            margin: 8px -12px;
            padding: 4px 12px;
          }
    
          .${sidebarHeader} {
            display: flex;
    
            .sidebar-header-title {
              width: calc(${leftSidebarWidth} - ${sidebarBtnHeight});
              display: none;
              align-items: center;
              padding: 0 ${sheshaStyles.paddingLG}px;
              font-weight: 500;
              font-size: 14px;
            }
    
            .${sidebarHeaderBtn} {
              height: ${sidebarBtnHeight};
              width: ${sidebarBtnHeight};
              display: flex;
              justify-content: center;
              align-items: center;
              font-weight: bolder;
              cursor: pointer;
            }
          }
    
          .${sidebarBody} {
            overflow-x: hidden;
            overflow-y: auto;
            display: flex;
            padding: ${sheshaStyles.paddingLG}px;
            flex: 1;
    
            .sidebar-body-content {
              width: 100%;
              display: none;
    
              &.open {
                display: block;
                height: 85vh;
              }
            }
    
            .sidebar-body-placeholder {
              width: ${sidebarBtnHeight};
    
              &.open {
                width: 0;
              }
            }
          }
        }
    
        .${sidebarContainerLeft} {
          border-right: 1px solid lightgrey;
          min-height: calc(100vh - 102px);
    
          &.open {
            .toggle-open-btn {
              transform: rotateX(180deg);
            }
          }
        }
    
        .${sidebarContainerRight} {
          border-left: 1px solid lightgrey;
          min-height: calc(100vh - 102px);
    
          &.open {
            .toggle-open-btn {
              transform: rotateX(180deg);
            }
          }
    
          .${sidebarHeader} {
            flex-direction: row-reverse;
    
            .sidebar-header-title {
              justify-content: flex-end;
            }
          }
    
          .${sidebarBody} {
            flex-direction: row-reverse;
          }
    
          .${prefixCls}-row.${prefixCls}-form-item {
            margin-bottom: 16px;
          }
    
          .${prefixCls}-form-item-label {
            padding-bottom: 4px;
          }
        }
    
        .${sidebarContainerMainArea} {
         width: 100%;
         display: flex;
         flex-direction: column;
         overflow: auto;
         height: calc(100vh - 100px);

          &::not(.no-padding) {
            padding: ${sheshaStyles.paddingLG}px;
          }
        }

        .${designerCanvas} {
          margin: 0 auto;
          height: 100%;
          transform-origin: top left;
        }
      }
    `);

  return {
    sidebarContainer,
    sidebarContainerHeader,
    sidebarContainerBody,
    sidebarContainerMainArea,
    sidebarContainerMainAreaBody,
    sidebarHeader,
    sidebarHeaderTitle,
    sidebarHeaderBtn,
    sidebarBody,
    sidebarBodyPlaceholder,
    sidebarBodyContent,
    sidebarContainerLeft,
    sidebarContainerRight,
    designerCanvas,
  };
});
