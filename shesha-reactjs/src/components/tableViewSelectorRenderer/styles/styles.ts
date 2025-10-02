import { createStyles } from '@/styles';
import { getWarningHoverEffects } from '@/styles';

export const useStyles = createStyles(({ css, cx, iconPrefixCls, token }) => {
  const indexViewSelectorBulb = "index-view-selector-bulb";

  const tableViewSelector = cx("table-view-selector", css`
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
    `);

  const titleContainer = cx("title-container", css`
        position: relative;
        display: inline-flex;
        align-items: center;
    `);

  const titleWrapper = cx("title-wrapper", css`
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorder};
        border-radius: 8px;
        box-shadow: 0 2px 4px 0 ${token.colorBgMask}15;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 160px;

        &:hover {
            border-color: ${token.colorPrimary};
            box-shadow: 0 4px 12px 0 ${token.colorPrimary}20;
            transform: translateY(-0.5px);
        }
    `);

  const filterIcon = cx("filter-icon", css`
        color: ${token.colorPrimary};
        font-size: 14px;
        opacity: 0.8;
        transition: opacity 0.2s ease;
    `);

  const titleContent = cx("title-content", css`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
        flex: 1;
    `);

  const titleLabel = cx("title-label", css`
        font-size: 12px;
        color: ${token.colorTextSecondary};
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1;
        white-space: nowrap;
    `);

  const titleName = cx("title-name", css`
        font-size: 14px;
        color: ${token.colorText};
        font-weight: 600;
        line-height: 1.2;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    `);

  const dropdownIcon = cx("dropdown-icon", css`
        color: ${token.colorTextTertiary};
        font-size: 10px;
        opacity: 0.7;
        transition: all 0.2s ease;
        margin-left: 4px;
    `);

  const activeBadge = cx("active-badge", css`
        position: absolute;
        top: -2px;
        right: -2px;

        .ant-badge-dot {
            background-color: ${token.colorSuccess};
            box-shadow: 0 0 0 2px ${token.colorBgContainer};
        }
    `);

  const clickableTitle = cx("clickable-title", css`
        cursor: pointer;

        &:hover .${titleWrapper} {
            border-color: ${token.colorPrimary};
            box-shadow: 0 4px 12px 0 ${token.colorPrimary}20;
            transform: translateY(-0.5px);

            .${filterIcon} {
                opacity: 1;
            }

            .${dropdownIcon} {
                opacity: 1;
                transform: translateY(0.5px);
            }
        }

        &:active .${titleWrapper} {
            transform: translateY(0);
            box-shadow: 0 2px 6px 0 ${token.colorPrimary}25;
        }
    `);

  const singleTitle = cx("single-title", css`
        .${titleWrapper} {
            cursor: default;
        }
    `);

  const dropdownOverlay = cx("dropdown-overlay", css`
        .ant-dropdown-menu {
            border-radius: 8px;
            box-shadow: 0 8px 24px 0 ${token.colorBgMask}20;
            border: 1px solid ${token.colorBorderSecondary};
            padding: 4px;

            .ant-dropdown-menu-item {
                border-radius: 6px;
                margin: 2px 0;
                transition: all 0.2s ease;

                &:hover {
                    background: ${token.colorPrimary}10;
                    color: ${token.colorPrimary};
                }

                &.ant-dropdown-menu-item-selected {
                    background: ${token.colorPrimary}15;
                    color: ${token.colorPrimary};
                    font-weight: 600;
                }
            }
        }
    `);

  const dropdownMenu = cx("dropdown-menu", css`
        min-width: 180px;
    `);

  return {
    tableViewSelector,
    indexViewSelectorBulb: cx(indexViewSelectorBulb, css`
            margin-left: 8px;

            .${iconPrefixCls} {
                ${getWarningHoverEffects(token)}
            }
        `),
    titleContainer,
    titleWrapper,
    filterIcon,
    titleContent,
    titleLabel,
    titleName,
    dropdownIcon,
    activeBadge,
    clickableTitle,
    singleTitle,
    dropdownOverlay,
    dropdownMenu,
  };
});
