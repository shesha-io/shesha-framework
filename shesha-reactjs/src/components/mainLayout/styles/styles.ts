import { sheshaStyles } from '@/styles';
import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx, responsive, token, prefixCls }) => {
  // variables
  const layoutTriggerHeight = sheshaStyles.layoutHeaderHeight; // @layout-trigger-height
  const shaPageHeadingHeight = '45px'; // @sha-page-heading-height
  const shaPageToolbarHeight = '33px'; // @sha-page-toolbar-height
  const backgroundColor = '#f0f2f5'; // @background-color
  const shaBorder = '1px solid #d3d3d3';
  const shaSiderExpandedWidth = '250px'; // @sha-sider-expanded-width
  const shaSiderCollapsedWidth = '60px'; // @sha-sider-collapsed-width

  const shaAntTransition = 'all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s'; // @sha-ant-transition
  const antdTransition = css`
    transition: ${shaAntTransition};
  `;
  const marginLeftTransition = css`
    ${antdTransition}
    margin-left: ${shaSiderExpandedWidth};

    &.collapsed {
      margin-left: ${shaSiderCollapsedWidth};
    }  
  `;

  const flexCenterAligned = css`
    display: flex;
    align-items: center;
  `;

  const flexCenterAlignedSpaceBetween = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const layout = cx(
    'site-layout',
    css`
        min-height: 100vh;
    `
  );
  const headerPart = css`
        display: flex;
        align-items: center;
    `;
  const antLayoutHeader = cx(css`
    border-bottom: ${shaBorder};
    position: fixed;
    z-index: 3;
    width: 100%;
    padding: unset;
    overflow: hidden;
  `);

  const layoutHeader = cx(css`
    height: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    ${marginLeftTransition}
  `);

  const layoutHeaderLeft = css`
        .search {
          display: flex;
          align-items: center;
          margin-left: ${sheshaStyles.paddingLG}px;
        }

        .logo,
        .search {
            ${responsive.tablet} {
            display: none;
          }
        }
    `;

  const customComponents = cx(css`
    margin-right: ${sheshaStyles.paddingLG}px;
    padding: 0px 10px 0px 10px;
  `);

  const layoutHeaderRight = css`
    ${headerPart}
  
    .actions {
      margin-right: ${sheshaStyles.paddingLG}px;
      color: ${token.colorPrimary};

      .action-icon {
        font-size: 16px;
        border-radius: 8px;

        &:hover {
          color: white;
          background-color: ${token.colorPrimaryBgHover};
        }
      }

      .hidden-sm-scr {
        // @media @phone-lg-size-query
          ${responsive.mobile} {
          display: none;
        }
      }
    }

    .account {
      .${prefixCls}-avatar {
        margin-left: ${sheshaStyles.paddingLG}px;
      }

      .${prefixCls}-dropdown-link {
        margin-left: 15px;
        color: black;

        &:hover {
          color: ${token.colorPrimary};
        }
      }

      .separator {
        border-left: 2px solid rgba(189, 189, 189, 0.37);
        margin-right: 5px;
      }

      ${responsive.tablet} {
        display: none;
      }
    }
  `;

  const sider = cx(css``);
  const content = cx(css`
    ${marginLeftTransition}
    margin-top: ${sheshaStyles.layoutHeaderHeight};
    background: ${backgroundColor};
  `);

  const mainSider = css`
    overflow-x: hidden;
    height: 100vh;
    position: fixed !important;
    padding-top: 48px;
    left: 0;

    z-index: 4;
    flex: 0 0 ${shaSiderExpandedWidth} !important;
    max-width: ${shaSiderExpandedWidth}  !important;
    min-width: ${shaSiderExpandedWidth}  !important;
    width: ${shaSiderExpandedWidth}  !important;

    ${sheshaStyles.thinScrollbars}

    .${prefixCls}-layout-sider-children {
      width: ${shaSiderExpandedWidth}  !important;
z
      .logo {
        margin-top: ${layoutTriggerHeight}  !important; // It should use a config
      }

      .${prefixCls}-menu-inline-collapsed {
        width: inherit;
      }
    }

    .${prefixCls}-layout-sider-trigger {
      top: 0 !important; // By default, the trigger is at the bottom. But we want it to be at the top for the sake of of
      width: ${shaSiderExpandedWidth} !important;
      font-size: 18px;
    }

    &.${prefixCls}-layout-sider-collapsed {
      flex: 0 0 ${shaSiderCollapsedWidth} !important;
      max-width: ${shaSiderCollapsedWidth} !important;
      min-width: ${shaSiderCollapsedWidth}  !important;
      width: ${shaSiderCollapsedWidth} !important;

      .${prefixCls}-layout-sider-children {
        width: ${shaSiderCollapsedWidth} !important;
      }

      .${prefixCls}-layout-sider-trigger {
        width: ${shaSiderCollapsedWidth} !important;
      }
    }
  `;

  const shaLayoutHeading = cx(
    '',
    css`
    &.has-heading {
      ${flexCenterAligned}

      min-height: ${shaPageHeadingHeight};
      max-height: ${shaPageHeadingHeight};
      border-bottom: 0.5px solid lightgrey;
      background: white;

      &.fixed-heading {
        position: sticky;
        z-index: 1;
        top: ${sheshaStyles.layoutHeaderHeight};
      }
    }
    `
  );

  const shaSiteLayoutBackgroundNoPadding = cx(css``);

  const headerWrapper = cx(css`
    width: 100%;
  `);

  const shaSiteLayoutBackground = css`
    background: ${backgroundColor};

    .sha-site-layout-toolbar {
      ${flexCenterAlignedSpaceBetween}
      min-height: ${shaPageToolbarHeight};
      background: white;

      margin: -12px;
      margin-bottom: 12px;
    }

    .sha-index-table-full {
      .sha-index-table-controls {
        background: white;
      }
    }

    &.fixed-heading {
      // margin-top: @sha-page-heading-height;
    }

    &.${shaSiteLayoutBackgroundNoPadding} {
      padding: unset;
    }  
  `;

  return {
    layout,
    antLayoutHeader,
    layoutHeader,
    layoutHeaderLeft,
    layoutHeaderRight,
    sider,
    content,
    mainSider,
    shaLayoutHeading,
    shaSiteLayoutBackground,
    shaSiteLayoutBackgroundNoPadding,
    customComponents,
    headerWrapper,
  };
});