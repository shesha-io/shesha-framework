import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
  const csRevisionListItem = "cs-revision-list-item";
  const csRevisionListSubheading = "cs-revision-list-subheading";
  const csRevision = "cs-revision";
  const csRevisionContent = "cs-revision-content";
  const csRevisionButtons = "cs-revision-buttons";
  const csRevisionsList = cx("cs-revisions-list", css`
    .${prefixCls}-list-items {
        .${prefixCls}-list-item {
        }
    }
    .${csRevisionListSubheading}{
        background-color: ${token.colorBgContainerDisabled};
    }
    .${csRevisionListItem} {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        &:hover {
            background-color: ${token.colorBgTextHover};
            .${csRevisionButtons} {
                transform: translateX(0);
            }
        }
    }
    .${csRevision} {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        
        .${csRevisionContent}{
            flex: 1;
            padding-right: 80px; /* Space for action buttons */
        }
        
        .${csRevisionButtons} {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            // background: linear-gradient(90deg, transparent 0%, white 30%);
            display: flex;
            align-items: center;
            padding: 0 16px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-left: 1px solid #f0f0f0;
        }
        &:hover {
            .${csRevisionButtons} {
                visibility: visible;
            }
        }
    }
`);

  return {
    csRevisionsList,
    csRevisionListItem,
    csRevisionListSubheading,
    csRevision,
    csRevisionContent,
    csRevisionButtons,
  };
});
