import { createStyles } from '@/styles';

export const LAYER_ROW_HEIGHT = 28;
export const LAYER_INDENT = 16;
export const LAYER_OVERSCAN = 8;

export const useStyles = createStyles(({ css, cx, token }) => {
  const panel = cx('sha-layers-panel', css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `);
  const toolbar = cx('sha-layers-toolbar', css`
    display: flex;
    align-items: center;
    gap: 4px;
  `);
  const toolbarSpacer = css`
    flex: 1;
  `;
  const matchCount = cx('sha-layers-match-count', css`
    color: ${token.colorTextSecondary};
    font-size: ${token.fontSizeSM}px;
  `);
  const tree = cx('sha-layers-tree', css`
    outline: none;
    &:focus-visible {
      box-shadow: inset 0 0 0 2px ${token.colorPrimaryBorder};
    }
  `);
  const row = cx('sha-layers-row', css`
    display: flex;
    align-items: center;
    gap: 6px;
    box-sizing: border-box;
    padding-right: 4px;
    border-radius: ${token.borderRadiusSM}px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;

    &:hover, &.is-canvas-hover {
      background: ${token.colorFillTertiary};
    }
    &.is-selected {
      background: ${token.colorPrimaryBg};
    }
    &.is-active {
      box-shadow: inset 0 0 0 1px ${token.colorPrimaryBorder};
    }
    &.is-hidden .sha-layers-row-label {
      color: ${token.colorTextTertiary};
    }
    &.is-flashing {
      animation: sha-layers-flash 600ms ease-out;
    }
    @keyframes sha-layers-flash {
      from { background: ${token.colorPrimaryBgHover}; }
    }
    .sha-layers-row-menu {
      visibility: hidden;
    }
    &:hover .sha-layers-row-menu, &.is-active .sha-layers-row-menu {
      visibility: visible;
    }
  `);
  const chevron = cx('sha-layers-row-chevron', css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 16px;
    height: 16px;
    font-size: 10px;
    color: ${token.colorTextSecondary};
  `);
  const icon = cx('sha-layers-row-icon', css`
    display: inline-flex;
    flex: none;
    color: ${token.colorTextSecondary};
  `);
  const label = cx('sha-layers-row-label', css`
    overflow: hidden;
    text-overflow: ellipsis;
  `);
  const secondary = cx('sha-layers-row-secondary', css`
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${token.colorTextTertiary};
    font-size: ${token.fontSizeSM}px;
  `);
  const emptyHint = cx('sha-layers-row-empty', css`
    color: ${token.colorTextQuaternary};
    font-size: ${token.fontSizeSM}px;
    font-style: italic;
  `);
  const badges = cx('sha-layers-row-badges', css`
    display: inline-flex;
    gap: 4px;
    margin-left: auto;
    color: ${token.colorTextSecondary};
  `);
  const menuButton = cx('sha-layers-row-menu', css`
    flex: none;
  `);
  const dropLine = cx('sha-layers-drop-line', css`
    position: absolute;
    right: 0;
    height: 2px;
    background: ${token.colorPrimary};
    pointer-events: none;
    &.is-blocked {
      background: ${token.colorError};
    }
  `);
  const dropBox = cx('sha-layers-drop-box', css`
    position: absolute;
    inset: 0;
    border: 2px solid ${token.colorPrimary};
    border-radius: ${token.borderRadiusSM}px;
    pointer-events: none;
    &.is-blocked {
      border-color: ${token.colorError};
    }
  `);
  const mark = cx('sha-layers-mark', css`
    padding: 0;
    color: inherit;
    background: ${token.colorWarningBg};
  `);

  return { panel, toolbar, toolbarSpacer, matchCount, tree, row, chevron, icon, label, secondary, emptyHint, badges, menuButton, dropLine, dropBox, mark };
});
