import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, responsive, token }) => {
  const inheritedButtonContent = cx(css`
    position: relative;
    top: 0px;
  `);

  const inheritedButton = cx(css`
    position: absolute;
    right: 0;
    top: 4px;
    font-size: 12px;
    height: 20px;
    max-width: 100%;
    margin-left: 5px;
    margin-right: 0px;
    color: ${token.colorPrimary};
    display: flex;
    justify-content: center;
    align-items: center;

    ${responsive.mobile} {
        right: 0;
        left: auto;
        top: -25px;
    }

    // special style when inside the sidebar
    .sidebar-container & {
        right: 0;
        left: auto;
        top: -25px;
    }
    .${sheshaStyles.verticalSettingsClass} & {
        right: 0;
        left: auto;
        top: -25px;
    }

  `);

  return {
    inheritedButtonContent,
    inheritedButton,
  };
});
