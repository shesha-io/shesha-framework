import { createStyles } from "antd-style";
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
    const leftSidebarWidth = "350px"; // @sha-left-sidebar-width
    const rightSidebarWidth = leftSidebarWidth; // @sha-right-sidebar-width
    const sidebarBtnHeight = "35px"; // @sha-collapsible-sidebar-btn-height

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

    const sidebarContainer = cx("sidebar-container", css`
      width: 100%;
      overflow-x: hidden;

      .${sidebarContainerMainAreaBody}{
        max-height: 85vh;
        overflow-y: auto;
        overflow-x: hidden;
        margin: 0 auto;
       
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
    
        .${sidebarContainerLeft},
        .${sidebarContainerRight} {
          &.allow-full-collapse {
            display: none;
          }
    
          &.open {
            display: block;

            .${sidebarHeader} {
              .sidebar-header-title {
                display: flex;
              }
            
            }
          }
    
          background: white;
          transition: ${sheshaStyles.transition};
    
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
              background: #282828;
              display: none;
              align-items: center;
              padding: 0 ${sheshaStyles.paddingLG}px;
              font-weight: 500;
              font-size: 16px;
              color: white;
            }
    
            .${sidebarHeaderBtn} {
              height: ${sidebarBtnHeight};
              width: ${sidebarBtnHeight};
              background: ${token.colorPrimary};
              color: white;
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
          max-width: ${rightSidebarWidth};
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
          transition: ${sheshaStyles.transition};
          width: 100%;
          position: sticky;
          overflow-x: auto;
    
          &::not(.no-padding) {
            padding: ${sheshaStyles.paddingLG}px;
          }
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
    };
});