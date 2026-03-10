import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const primaryColor = token.colorPrimary;
  const titleContainer = 'title-container';
  const shaSectionSeparator = cx("sha-section-separator", css`
    height: ${sheshaStyles.pageHeadingHeight}px;
    border-bottom: var(--border-thickness) var(--border-style) var(--border-color);

    .inline {
      border-bottom: var(--border-thickness) var(--border-style) var(--border-color);
    }
    .${titleContainer} {
      flex-wrap: nowrap;
      align-items: center;
      width: 100%;
    };
  `);


  const vertical = cx("vertical-separator", css`
        min-width: 0 !important;
        width: 0px;
        margin: 16px;
        border-right: var(--border-thickness) var(--border-style) var(--border-color);
    `);

  const helpIcon = cx("help-icon-question-circle", css`
        color: #aaa;
        margin-left: 8px;
        font-size: 14px !important;
    `);

  return {
    shaSectionSeparator,
    primaryColor,
    helpIcon,
    titleContainer,
    vertical,
  };
});
