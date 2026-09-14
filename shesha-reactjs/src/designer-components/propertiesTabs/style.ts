import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const searchIcon = cx(css`
    color: ${token.colorTextPlaceholder};
  `);

  const searchField = cx(css`
    z-index: unset;
    margin-bottom: 8px;
    flex: 0 0 auto;

    .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:hover {
      z-index: unset !important;
    }
  `);

  const content = cx("sha-tabs-content", css`
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    
    &&&& .ant-collapse-header, .ant-collapse-body  {
      padding: 5px 0px !important;
    }

    /* Tab strip: fixed. */
    > .ant-tabs-nav {
      flex: 0 0 auto;
      margin-bottom: 8px;
    }

    /* Tab body: takes the remaining space and owns the scroll. */
    > .ant-tabs-content-holder {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      overflow-x: hidden;
      overflow-y: auto;
      ${sheshaStyles.thinScrollbars}

      > .ant-tabs-content {
        flex: 1 1 auto;
        height: auto;

        > .ant-tabs-tabpane {
          height: auto;
        }
      }
    }

    .ant-tabs-tab, .ant-tabs-nav-operations {
      height: 30px;
    }
    .ant-tabs-tab {
      --ant-tabs-card-padding-sm: 0 8px;
    }

    .ant-form-item-vertical .ant-form-item-row {
      flex-direction: row !important;
    }

    .sha-toolbar-btn-configurable, .ant-btn {
      display: flex;
      align-items: center;
      max-width: 100%;
      span {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .ant-form-item {
      margin: 0px !important;
    }

    * > .sha-required-mark {
      margin-left: 4px;
      color: ${token.colorErrorText};
      font-family: ${token.fontFamily};
      line-height: 1;
  }
  `);

  return {
    root,
    searchField,
    searchIcon,
    content,
  };
});
