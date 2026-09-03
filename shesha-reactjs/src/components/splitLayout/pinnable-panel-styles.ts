import { sheshaStyles } from '@/styles';
import { createStyles } from 'antd-style';

export const usePinnablePanelStyles = createStyles(
  ({ token, css }, { $expanded }: { $expanded: boolean }) => ({
    panelContainer: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      background: ${token.colorBgContainer};
      overflow: hidden;
    `,

    header: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background: ${token.colorBgElevated};
      border-bottom: 1px solid ${token.colorBorderSecondary};
      flex-shrink: 0;
      min-height: 36px;
    `,

    content: css`
      flex: 1;
      overflow: auto;
      ${sheshaStyles.thinScrollbars}
      padding: 12px;
      display: ${$expanded ? 'block' : 'none'};
    `,

    collapsedBar: css`
      display: ${$expanded ? 'none' : 'flex'};
      align-items: center;
      padding: 12px;
      height: 100%;
      width: 100%;
      color: ${token.colorTextSecondary};
      font-size: 13px;
      gap: 8px;
      cursor: pointer;
      transition: background 0.2s;
      &:hover {
        background: ${token.colorBgTextHover};
      }
    `,

    verticalText: css`
      writing-mode: vertical-rl;
      letter-spacing: 4px;
    `,

    horizontalText: css``,
    expandedContent: css`
      display: ${$expanded ? 'flex' : 'none'};
      flex-direction: column;
      height: 100%;
    `,
  }),
);
