import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx }) => {
  const shaLayoutHeadingTitle = "sha-layout-heading-title";
  const shaLayoutHeadingContent = cx("sha-layout-heading-content", css`
        ${sheshaStyles.flexCenterAlignedSpaceBetween}
        padding: 0 ${sheshaStyles.paddingLG}px;
        width: 100%;

        .${shaLayoutHeadingTitle} {
            margin: unset;
            font-size: 16px;
        }
  `);
  return {
    shaLayoutHeadingContent,
    shaLayoutHeadingTitle,
  };
});
