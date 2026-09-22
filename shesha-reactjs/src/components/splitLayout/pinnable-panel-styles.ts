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
      min-height: 0;
      overflow: auto;
      ${sheshaStyles.thinScrollbars}
      padding: 12px;
      display: ${$expanded ? 'block' : 'none'};
      /* Anchors a panel whose content sizes itself to the panel (see .sha-properties-tabs). */
      position: relative;

      /*
       * A panel that manages its own scrolling - the form designer's settings tabs, which keep their
       * search box and tab strip fixed while only the tab body scrolls - stretches to the panel's height
       * and takes the scrollbar off the panel itself. Absolute positioning gets it that height without
       * needing every wrapper between here and it to pass a height down.
       */
      &:has(.sha-properties-tabs) {
        overflow: hidden;
        /* The inset below reproduces this padding, so keeping both would make the absolutely-positioned
           child overflow the padding box by 12px. */
        padding: 0;
      }

      .sha-properties-tabs {
        position: absolute;
        inset: 12px;
        /* The inset already fixes both edges, so the root's own height:100% (which it needs when a host
           does give it a height) would otherwise resolve against the container and overhang the bottom. */
        height: auto;
      }
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
    `,

    horizontalText: css``,
    expandedContent: css`
      display: ${$expanded ? 'flex' : 'none'};
      flex-direction: column;
      height: 100%;
    `,
  }),
);
